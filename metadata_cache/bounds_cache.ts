import { MetadataCache } from "./metadata_cache";
import { Layout } from "../layout/layout";
import { LayoutNode } from "../layout/nodes";
import { Vector, BoundingRectangle } from "../util/math";

export class BoundsCache extends MetadataCache {
    constructor() {
        super({ nodeCreated: true, nodeMoved: true, propertyChanged: true }); // TODO: narrow down filters for dirty nodes
    }

    #isPreProcessNode(node: LayoutNode): boolean {
        if (Layout.isType(node, "Shape") || Layout.isType(node, "Page")) {
            return true;
        } else {
            return false;
        }
    }

    #isPostProcessNode(node: LayoutNode): boolean {
        return !this.#isPreProcessNode(node);
    }

    processNode(node: LayoutNode): void {
        if (this.#isPreProcessNode(node)) {
            const localBoundingRectangle = Layout.boundingRectangle(node);
            const worldTransform = node.metadata.worldTransform;
            const boundingRectangle = localBoundingRectangle.transform(worldTransform);
            node.metadata.boundingRectangle = boundingRectangle;
            node.metadata.alignedBoundingRectangle = boundingRectangle.align();
        }
    }

    processNodePost(node: LayoutNode): void {
        if (this.#isPostProcessNode(node)) {
            let childBounds: (Vector | BoundingRectangle)[] = [];
            for (const child of node.children) {
                if (child.metadata.alignedBoundingRectangle) {
                    childBounds.push(child.metadata.alignedBoundingRectangle);
                }
            }
            if (childBounds.length > 0) {
                node.metadata.alignedBoundingRectangle = BoundingRectangle.AlignedEnclosing(childBounds);
                node.metadata.boundingRectangle = node.metadata.alignedBoundingRectangle;
            } else {
                node.metadata.alignedBoundingRectangle = new BoundingRectangle(0.0, 0.0, 0.0, 0.0).transform(node.metadata.worldTransform);
                node.metadata.boundingRectangle = node.metadata.alignedBoundingRectangle;
            }
        }
    }
}