import { Layout } from "../../layout/layout";
import { LayoutNode } from "../../layout/nodes";
import { renderer as pageRenderer } from "./nodes/page";
import { renderer as rectangleRenderer } from "./nodes/rectangle";
import { renderer as circleRenderer } from "./nodes/circle";
import { renderer as ellipseRenderer } from "./nodes/ellipse";
import { Vector } from "../../util/math";

export type CacheCanvasOffset = Vector;
export const cacheCanvasMargin = 1;
export type CanvasAPINodeRenderer = (node: any, ctx: CanvasRenderingContext2D, canvas?: HTMLCanvasElement) => void | CacheCanvasOffset;

export class CanvasAPIRenderer {
    #nodeRenderers: Map<string, CanvasAPINodeRenderer> = new Map();

    constructor() {
        this.#nodeRenderers.set("Page", pageRenderer);
        this.#nodeRenderers.set("Rectangle", rectangleRenderer);
        this.#nodeRenderers.set("Circle", circleRenderer);
        this.#nodeRenderers.set("Ellipse", ellipseRenderer);
    }

    renderNode(node: LayoutNode, ctx: CanvasRenderingContext2D, canvas?: HTMLCanvasElement): void | CacheCanvasOffset {
        const nodeType = Layout.mainType(node);
        if (this.canRender(nodeType)) {
            return this.#nodeRenderers.get(nodeType)(node, ctx, canvas);
        }
    }

    canRender(type: string) {
        return this.#nodeRenderers.has(type);
    }
}