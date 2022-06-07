import { NodeTool } from "./node_tool";
import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { RectangleNode } from "../../../../layout/nodes";
import { Marker } from "../../marker_renderer";
import { MatrixMultiplicationMode, Vector } from "../../../../util/math";

export class ChangeSizeTool extends NodeTool {
    _node: RectangleNode;

    #mask: Vector = null;
    #pointerStart: Vector = null;
    #startSize: {
        x: number,
        y: number,
        width: number,
        height: number
    };

    constructor(viewport: LayoutViewport, node: RectangleNode = null) {
        super(viewport, node);
    }

    startDrag(event: CustomEvent) {
        if (this._node === null || this.#mask === null) {
            return;
        }

        this.#pointerStart = event.detail.position.viewport;
        this.#startSize = {
            x: this._node.x,
            y: this._node.y,
            width: this._node.width,
            height: this._node.height
        }
    }

    drag(event: CustomEvent) {
        if (this._node === null || this.#mask === null || this.#pointerStart === null) {
            return;
        }

        const localOffset = this._localOffset(event.detail.position.viewport.subtract(this.#pointerStart));
        const localSizeChange = new Vector(this.#mask.x * localOffset.x, this.#mask.y * localOffset.y);
        const localMaskedOffset = new Vector(Math.abs(this.#mask.x) * localOffset.x, Math.abs(this.#mask.y) * localOffset.y);
        const localToParent = this._node.parent.metadata.inverseWorldTransform.multiply(this._node.metadata.worldTransform);
        const parentMaskedOffset = localToParent.multiply(localMaskedOffset, MatrixMultiplicationMode.Direction);
        this._node.width = this.#startSize.width + localSizeChange.x;
        this._node.height = this.#startSize.height + localSizeChange.y;
        this._node.x = this.#startSize.x + parentMaskedOffset.x / 2;
        this._node.y = this.#startSize.y + parentMaskedOffset.y / 2;
    }

    endDrag() {
        this.#pointerStart = null;

        this.emit("finished");
    }

    set mask(mask: Vector) {
        this.#mask = mask;
    }

    set node(node: RectangleNode) {
        if (node && Layout.isType(node, "Rectangle")) {
            this._node = node;
        } else {
            this._node = null;
        }
    }
}