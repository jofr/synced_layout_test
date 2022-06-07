import { Layout, LayoutSceneGraph } from "../../layout/layout";
import { LayoutNode } from "../../layout/nodes";
import { LayoutViewport } from "../../view/layout_viewport";
import { CanvasAPIRenderer } from "./renderer";
import { RenderCache } from "../../metadata_cache/render_cache";
import { Page } from "../../layout/nodes/page";
import { Matrix } from "../../util/math";

const settings = {
    cacheShapes: false
}

export class CanvasAPICompositor {
    #sceneGraph: LayoutSceneGraph;
    #viewport: LayoutViewport;
    #renderer: CanvasAPIRenderer;

    constructor(sceneGraph: LayoutSceneGraph, viewport: LayoutViewport) {
        this.#sceneGraph = sceneGraph;
        this.#viewport = viewport;
        this.#renderer = new CanvasAPIRenderer();
        this.#sceneGraph.addSystem(new RenderCache(this.#renderer));
    }

    renderAndComposeAll() {
        this.#sceneGraph.traverse(this.#processNodePre.bind(this), this.#processNodePost.bind(this));
    }

    #processNodePre(node: LayoutNode) {
        if (!node.metadata.worldTransform) {
            return;
        }

        if (Layout.isType(node, "Page")) {
            this.#viewport.ctx.save();
            let tm = this.#viewport.transform.multiply(node.metadata.worldTransform) as Matrix;
            this.#viewport.ctx.setTransform(tm);
            let page = node as Page;
            this.#viewport.ctx.beginPath();
            this.#viewport.ctx.rect(0, 0, page.width, page.height);
            this.#viewport.ctx.clip();
        }

        this.#viewport.ctx.save();

        let tm = this.#viewport.transform.multiply(node.metadata.worldTransform) as Matrix;
        this.#viewport.ctx.setTransform(tm);
        if (node.metadata.hovered) { this.#viewport.ctx.globalAlpha = .5; }

        if (node.metadata.renderCache?.canvas && node.metadata.renderCache?.offset) {
            this.#viewport.ctx.drawImage(node.metadata.renderCache.canvas, -node.metadata.renderCache.offset.x, -node.metadata.renderCache.offset.y);
        } else {
            this.#renderer.renderNode(node, this.#viewport.ctx);
        }

        this.#viewport.ctx.restore();
    }

    #processNodePost(node: LayoutNode) {
        if (Layout.isType(node, "Page")) {
            this.#viewport.ctx.restore();
        }
    }
}