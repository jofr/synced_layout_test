import { Tool } from "../tool";
import { Events } from "../../../../util/events";
import { LayoutViewport } from "../../../layout_viewport";
import { EditorEvent } from "../../layout_viewport_editor";
import { LayoutNode } from "../../../../layout/nodes";
import { Marker } from "../../marker_renderer";
import { MatrixMultiplicationMode, Vector } from "../../../../util/math";

export class NodeTool extends Tool {
    _node: LayoutNode;

    constructor(viewport: LayoutViewport, node: LayoutNode = null) {
        super(viewport);

        this._node = node;
    }

    _parentOffset(offset: Vector): Vector {
        const worldOffset = this._viewport.inverseTransform.multiply(offset, MatrixMultiplicationMode.Direction) as Vector;
        return this._node.parent.metadata.inverseWorldTransform.multiply(worldOffset, MatrixMultiplicationMode.Direction) as Vector;
    }

    _parentPosition(position: Vector): Vector {
        const worldPosition = this._viewport.inverseTransform.multiply(position) as Vector;
        return this._node.parent.metadata.inverseWorldTransform.multiply(worldPosition) as Vector;
    }

    _localOffset(offset: Vector): Vector {
        const worldOffset = this._viewport.inverseTransform.multiply(offset, MatrixMultiplicationMode.Direction) as Vector;
        return this._node.metadata.inverseWorldTransform.multiply(worldOffset, MatrixMultiplicationMode.Direction) as Vector;
    }

    _localPosition(position: Vector): Vector {
        const worldPosition = this._viewport.inverseTransform.multiply(position) as Vector;
        return this._node.metadata.inverseWorldTransform.multiply(worldPosition) as Vector;
    }
}