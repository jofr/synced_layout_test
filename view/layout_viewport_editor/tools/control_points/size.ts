import { ToolProxyControlPoint } from "./control_point";
import { LayoutViewport } from "../../../layout_viewport";
import { Layout } from "../../../../layout/layout";
import { RectangleNode } from "../../../../layout/nodes";
import { Vector } from "../../../../util/math";
import { ChangeSizeTool } from "../node_tools/change_size";

export class SizeControlPoint extends ToolProxyControlPoint {
    _node: RectangleNode;
    _proxyTool: ChangeSizeTool;

    #mask: Vector;

    constructor(viewport: LayoutViewport, node: RectangleNode, mask: Vector) {
        super(viewport, node);

        this.#mask = mask;
        this._proxyTool = new ChangeSizeTool(this._viewport, this._node);
        this._proxyTool.mask = this.#mask;
    }

    get position(): Vector {
        const top = this._node.metadata.controlPoints?.bottom.subtract(this._node.metadata.controlPoints.center);
        const right = this._node.metadata.controlPoints?.right.subtract(this._node.metadata.controlPoints.center);
        return this._node.metadata.controlPoints?.center.add(top.multiply(this.#mask.y)).add(right.multiply(this.#mask.x));
    }
}