import { ToolProxyControlPoint } from "./control_point";
import { LayoutViewport } from "../../../layout_viewport";
import { ChangeRotationTool } from "../node_tools/change_rotation";
import { TransformNode } from "../../../../layout/nodes";
import { Marker } from "../../marker_renderer";
import { Vector } from "../../../../util/math";

export class RotationControlPoint extends ToolProxyControlPoint {
    _node: TransformNode;
    _proxyTool: ChangeRotationTool;

    constructor(viewport: LayoutViewport, node: TransformNode) {
        super(viewport, node);

        this._proxyTool = new ChangeRotationTool(this._viewport, this._node);
    }

    get position(): Vector {
        const topDirection = this._node.metadata.controlPoints?.top.subtract(this._node.metadata.controlPoints.center).normalize();
        return this._node.metadata.controlPoints?.top.add(topDirection.multiply(25.0));
    }

    get markers(): Marker[] {
        let markers = [];

        markers.push({
            type: "LineMarker",
            start: this._node.metadata.controlPoints?.top,
            end: this.position
        });
        markers.push(...super.markers);

        return markers;
    }
}