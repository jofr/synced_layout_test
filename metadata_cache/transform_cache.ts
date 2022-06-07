import { MetadataCache } from "./metadata_cache";
import { Layout, LayoutSceneGraph } from "../layout/layout";
import { LayoutNode, BindingNode, PageNode, TransformNode } from "../layout/nodes";
import { BindingSystem } from "../layout/binding_system";
import { BookBinding } from "../layout/binding_systems/book";
import { CarouselBinding } from "../layout/binding_systems/carousel";
import { Matrix } from "../util/math";

export class TransformCache extends MetadataCache {
    #bindingSystems: Map<string, BindingSystem> = new Map();

    constructor() {
        super({ nodeCreated: true, nodeMoved: true, propertyChanged: true }); // TODO: narrow down filters for dirty nodes

        this.#bindingSystems.set("book", new BookBinding());
        this.#bindingSystems.set("carousel", new CarouselBinding());
    }

    processNode(node: LayoutNode, context: any): void {
        if (Layout.isType(node, "Binding")) {
            const binding = node as BindingNode;

            context.binding = {
                method: binding.method,
                currentPage: 1
            }

            node.metadata.worldTransform = node.parent ? node.parent.metadata.worldTransform : Matrix.IdentityMatrix();
        } else if (Layout.isType(node, "Page")) {
            const page = node as PageNode;

            const parentTransform = node.parent.metadata.worldTransform ? node.parent.metadata.worldTransform : Matrix.IdentityMatrix();
            const localTransform = this.#bindingSystems.get(context.binding.method).pageTransform(page, context.binding);
            node.metadata.worldTransform = parentTransform.multiply(localTransform);

            context.binding.currentPage++;
        } else if (Layout.isType(node, "Transform")) {
            const transform = node as TransformNode;

            const localTransform = Matrix.TranslateMatrix(transform.x, transform.y).multiply(Matrix.RotateMatrix(transform.rotation).multiply(Matrix.ShearMatrix(transform.skewX, transform.skewY).multiply(Matrix.ScaleMatrix(transform.scale, transform.scale))));
            if (!node.parent) {
                transform.metadata.worldTransform = localTransform;
            } else {
                transform.metadata.worldTransform = node.parent.metadata.worldTransform.multiply(localTransform);
            }
        } else {
            if (!node.parent) {
                node.metadata.worldTransform = Matrix.IdentityMatrix();
            } else {
                node.metadata.worldTransform = node.parent.metadata.worldTransform;
            }
        }
        
        node.metadata.inverseWorldTransform = node.metadata.worldTransform.invert();
    }
}