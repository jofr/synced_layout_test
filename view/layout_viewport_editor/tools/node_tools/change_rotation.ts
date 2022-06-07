import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { TransformNode } from "../../../../layout/nodes";
import { Vector } from "../../../../util/math";
import { NodeTool } from "./node_tool";
import { Marker } from "../../marker_renderer";

export class ChangeRotationTool extends NodeTool {
    _node: TransformNode;

    #pointerStart: Vector = null;
    #pointerCurrent: Vector = null;
    #pivotPoint: Vector = null;
    #startDirection: Vector = null;
    #startRotation: number = null;

    constructor(viewport: LayoutViewport, node: TransformNode = null) {
        super(viewport, node);
    }

    startDrag(event: CustomEvent): void {
        if (this._node === null) {
            return;
        }

        this.#pointerStart = event.detail.position.viewport;
        this.#pointerCurrent = this.#pointerStart;
        this.#pivotPoint = this._node.metadata.controlPoints?.center;
        this.#startDirection = this.#pointerStart.subtract(this.#pivotPoint).normalize();
        this.#startRotation = this._node.rotation;
    }

    drag(event: CustomEvent): void {
        if (this._node === null || this.#pointerStart === null || this.#pivotPoint === null || this.#startDirection === null || this.#startRotation === null) {
            return;
        }

        this.#pointerCurrent = event.detail.position.viewport
        const direction = this.#pointerCurrent.subtract(this.#pivotPoint).normalize();
        const dot = direction.dot(this.#startDirection);
        const det = direction.cross(this.#startDirection);
        const angle = -Math.atan2(det, dot);
        this._node.rotation = this.#startRotation + angle;
    }

    endDrag(): void {
        this.#pointerStart = null;
        this.#pivotPoint = null;
        this.#startDirection = null;
        this.#startRotation = null;

        this.emit("finished");
    }

    set node(node: TransformNode) {
        if (node && Layout.isType(node, "Transform")) {
            this._node = node;
        } else {
            this._node = null;
        }
    }

    get markers(): Marker[] {
        if (this._node === null || this.#pivotPoint === null || this.#pointerStart === null || this.#pointerCurrent === null) {
            return [];
        } else {
            return [
                {
                    type: "LineMarker",
                    start: this.#pivotPoint,
                    end: this.#pointerStart
                },
                {
                    type: "LineMarker",
                    start: this.#pivotPoint,
                    end: this.#pointerCurrent
                }
            ];
        }
    }
}