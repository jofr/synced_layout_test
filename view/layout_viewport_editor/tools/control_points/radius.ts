import { ControlPoint, ToolProxyControlPoint } from "./control_point";
import { EditorEvent } from "../../layout_viewport_editor";
import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { CircleNode, EllipseNode } from "../../../../layout/nodes";
import { Marker } from "../../marker_renderer";
import { Vector } from "../../../../util/math";
import { ChangeRadiusTool } from "../node_tools/change_radius";

export class RadiusControlPoint extends ToolProxyControlPoint {
    _node: CircleNode | EllipseNode;
    _proxyTool: ChangeRadiusTool;

    #radiusProperty: string;

    constructor(viewport: LayoutViewport, node: CircleNode | EllipseNode, radiusProperty: "r" | "rx" | "ry") {
        super(viewport, node);

        this.#radiusProperty = radiusProperty;
        this._proxyTool = new ChangeRadiusTool(this._viewport, node);
        this._proxyTool.radiusProperty = this.#radiusProperty;
        this._proxyTool.lockDirection = true;
    }

    get position(): Vector {
        if (this.#radiusProperty == "ry") {
            return this._node.metadata.controlPoints?.top;
        } else {
            return this._node.metadata.controlPoints?.right;
        }
    }

    get markers(): Marker[] {
        let markers = [];

        markers.push({
            type: "LineMarker",
            start: this._node.metadata.controlPoints?.center,
            end: this.#radiusProperty != "ry" ? this._node.metadata.controlPoints?.right : this._node.metadata.controlPoints?.top
        });
        markers.push({
            type: "PointMarker",
            shape: "Circle",
            role: "Guide",
            position: this._node.metadata.controlPoints?.center
        });
        markers.push(...super.markers);

        return markers;
    }
}