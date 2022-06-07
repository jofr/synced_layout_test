import { MetadataCache } from "./metadata_cache";
import { Layout, LayoutSceneGraph } from "../layout/layout";
import { LayoutNode, ShapeNode } from "../layout/nodes";
import { CanvasAPIRenderer } from "../renderer/canvas_api/renderer";
import { Vector } from "../util/math";

const settings = {
    shapes: false
}

export class RenderCache extends MetadataCache {
    #renderer: CanvasAPIRenderer;

    constructor(renderer: CanvasAPIRenderer) {
        super({ nodeCreated: true, nodeMoved: true, propertyChanged: true }); // TODO: narrow down filters for dirty nodes

        this.#renderer = renderer;
    }

    cacheShape(node: ShapeNode): void {
        if (!node.metadata.renderCache) {
            node.metadata.renderCache = { };
            node.metadata.renderCache.canvas = document.createElement("canvas");
            node.metadata.renderCache.ctx = node.metadata.renderCache.canvas.getContext("2d");
        }

        let offset = this.#renderer.renderNode(node, node.metadata.renderCache.ctx, node.metadata.renderCache.canvas) as Vector;
        node.metadata.renderCache.offset = offset;
    }

    processNode(node: LayoutNode): void {
        if (settings.shapes && Layout.isType(node, "Shape")) {
            this.cacheShape(node as ShapeNode);
        }
    }
}