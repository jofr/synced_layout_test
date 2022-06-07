import { NodeTool } from "./node_tool";
import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { CircleNode, EllipseNode } from "../../../../layout/nodes";
import { Marker } from "../../marker_renderer";
import { Vector } from "../../../../util/math";

export class ChangeRadiusTool extends NodeTool {
    _node: CircleNode | EllipseNode;

    #radiusProperty: string = "r";
    #lockDirection: boolean = true;
    #radiusDirection: Vector = new Vector(1.0, 0.0);
    #radiusStart: number = null;
    #pointerStart: Vector = null;

    constructor(viewport: LayoutViewport, node: CircleNode | EllipseNode = null) {
        super(viewport, node);
    }

    startDrag(event: CustomEvent): void {
        if (this._node === null) {
            return;
        }

        this.#radiusStart = this._node[this.#radiusProperty];
        this.#pointerStart = event.detail.position.viewport;
    }

    drag(event: CustomEvent) {
        if (this._node === null || this.#radiusStart === null || this.#pointerStart === null) {
            return;
        }

        const localOffset = this._localOffset(event.detail.position.viewport.subtract(this.#pointerStart));
        if (!this.#lockDirection) {
            this._node[this.#radiusProperty] = Math.max(0.0, this.#radiusStart + localOffset.length()); /* TODO: get direction so that radius can also get smaller */
        } else {
            const lockedOffset = new Vector(this.#radiusDirection.x * localOffset.x, this.#radiusDirection.y * localOffset.y);
            if (this.#radiusDirection.x != 0) { /* Cannot use lockedOffset.length() because we need the sign (+ or -) */
                this._node[this.#radiusProperty] = Math.max(0.0, this.#radiusStart + lockedOffset.x);
            } else {
                this._node[this.#radiusProperty] = Math.max(0.0, this.#radiusStart + lockedOffset.y);
            }
        }
    }

    endDrag(): void {
        this.#radiusStart = null;
        this.#pointerStart = null;

        this.emit("finished");
    }

    set radiusProperty(property: string) {
        if (["r", "rx", "ry"].includes(property)) {
            if (["r", "rx"].includes(property)) {
                this.#radiusDirection = new Vector(1.0, 0.0);
            } else {
                this.#radiusDirection = new Vector(0.0, -1.0);
            }
            this.#radiusProperty = property;
        }
    }

    set lockDirection(lock: boolean) {
        this.#lockDirection = lock;
    }

    set node(node: CircleNode | EllipseNode) {
        if (Layout.isType(node, "Circle") || Layout.isType(node, "Ellipse")) {
            this._node = node;
        } else {
            this._node = null;
        }
    }
}