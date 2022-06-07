import { NodeTool } from "./node_tool";
import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { Rectangle } from "../../../../layout/nodes/rectangle";
import { Circle } from "../../../../layout/nodes/circle";
import { CircleNode, RectangleNode, ShapeNode } from "../../../../layout/nodes";
import { Vector } from "../../../../util/math";
import { RadiusControlPoint } from "../control_points/radius";
import { SizeControlPoint } from "../control_points/size";
import { Marker } from "../../marker_renderer";
import { ControlPoint } from "../control_points/control_point";
import { ChangeRadiusTool } from "./change_radius";
import { ChangeSizeTool } from "./change_size";

export class CreateShapeTool extends NodeTool {
    _type: "Circle" | "Rectangle" = "Rectangle";
    _node: ShapeNode = null;

    #proxyTool: NodeTool = null;

    #createShapeNode(): void {
        let node: ShapeNode = null;
        if (this._type == "Circle") {
            node = this._viewport.layout.createNode(new Circle({
                stroke: "#000000",
                strokeWidth: 1.0,
                fill: "transparent"
            })) as CircleNode;
        } else {
            node = this._viewport.layout.createNode(new Rectangle({
                stroke: "#000000",
                strokeWidth: 1.0,
                fill: "transparent"
            })) as RectangleNode;
        }
        window.selection.set(node); /* TODO */
        this.node = node;
    }

    startDrag(event: CustomEvent): void {
        if (this._node === null) {
            this.#createShapeNode();
        }

        const position = this._parentPosition(event.detail.position.viewport);
        this._node.x = position.x;
        this._node.y = position.y;

        if (this._type == "Circle") {
            const r = new ChangeRadiusTool(this._viewport);
            r.node = this._node as CircleNode;
            r.radiusProperty = "r";
            r.lockDirection = false;
            this.#proxyTool = r;
            this.#proxyTool.startDrag(event);
        } else {
            const size = new ChangeSizeTool(this._viewport);
            size.node = this._node as RectangleNode;
            size.mask = new Vector(1.0, 1.0);
            this.#proxyTool = size;
            this.#proxyTool.startDrag(event);
        }
    }

    drag(event: CustomEvent): void {
        if (this._node === null || this.#proxyTool === null) {
            return;
        }

        this.#proxyTool.drag(event);
    }

    endDrag(): void {
        this.#proxyTool = null;
        this.node = null;

        this.emit("finished");
    }

    set type(type: "Rectangle" | "Circle") {
        this._type = type;
    }

    set node(node: ShapeNode) {
        if (node && (Layout.isType(node, "Rectangle") || Layout.isType(node, "Circle"))) {
            this._type = Layout.mainType(node) as ("Rectangle" | "Circle");
            this._node = node;
        } else {
            this._node = null;
        }
    }

    get markers(): Marker[] {
        return this.#proxyTool ? this.#proxyTool.markers : [];
    }
}