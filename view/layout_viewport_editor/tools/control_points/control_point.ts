import { NodeTool } from "../node_tools/node_tool";
import { Vector } from "../../../../util/math";
import { Marker } from "../../marker_renderer";
import { LayoutViewport } from "../../../layout_viewport";
import { LayoutNode } from "../../../../layout/nodes";
import { EditorEvent } from "../../layout_viewport_editor";

export class ControlPoint extends NodeTool {
    _shape: string = "Circle";
    _targetSize: number = 20.0;

    isPointInside(point: Vector) {
        const topLeft = this.position.subtract(new Vector(this._targetSize / 2, this._targetSize / 2));

        if (point.x > topLeft.x && point.x < topLeft.x + this._targetSize && point.y > topLeft.y && point.y < topLeft.y + this._targetSize) {
            return true;
        } else {
            return false;
        }
    }

    get position(): Vector {
        return new Vector(0, 0);
    }

    get markers(): Marker[] {
        return [{
            type: "PointMarker",
            shape: this._shape,
            position: this.position
        }];
    }
}

export class ToolProxyControlPoint extends ControlPoint {
    _proxyTool: NodeTool;

    constructor(viewport: LayoutViewport, node: LayoutNode) {
        super(viewport, node);
    }

    click(event: EditorEvent): void {
        this._proxyTool.click(event);
    }

    startDrag(event: EditorEvent): void {
        this._proxyTool.startDrag(event);
    }

    drag(event: EditorEvent): void {
        this._proxyTool.drag(event);
    }

    endDrag(event: EditorEvent): void {
        this._proxyTool.endDrag(event);
    }
}