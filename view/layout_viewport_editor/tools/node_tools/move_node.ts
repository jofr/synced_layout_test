import { NodeTool } from "./node_tool";
import { LayoutViewport } from "../../../layout_viewport";
import { TransformNode } from "../../../../layout/nodes";
import { Vector } from "../../../../util/math";
import { Layout } from "../../../../layout/layout";

export class MoveNodeTool extends NodeTool {
    _node: TransformNode;

    #nodeStart: Vector = null;
    #pointerStart: Vector = null;

    constructor(viewport: LayoutViewport, node: TransformNode = null) {
        super(viewport, node);
    }

    startDrag(event: CustomEvent): void {
        console.log("moveNode startDrag")

        if (this._node === null) {
            const nodes = this._viewport.layout.findNodes(event.detail.position.world);
            console.log(nodes);
            if (nodes.length > 0) {
                this._node = nodes[0] as TransformNode; /* TODO */
            } else {
                return;
            }
        }

        this.#nodeStart = new Vector(this._node.x, this._node.y);
        this.#pointerStart = event.detail.position.viewport;
    }

    drag(event: CustomEvent): void {
        console.log("moveNode drag")

        if (this._node === null || this.#nodeStart === null || this.#pointerStart === null) {
            return;
        }

        const parentOffset = this._parentOffset(event.detail.position.viewport.subtract(this.#pointerStart));
        this._node.x = this.#nodeStart.x + parentOffset.x;
        this._node.y = this.#nodeStart.y + parentOffset.y;
    }

    endDrag(): void {
        console.log("moveNode endDrag")

        this.#nodeStart = null;
        this.#pointerStart = null;
    }

    set node(node: TransformNode) {
        if (Layout.isType(node, "Transform")) {
            this._node = node;
        } else {
            this._node = null;
        }

        console.log(this._node)
    }
}