import { Tool } from "./tool";
import { LayoutViewportEditor } from "../layout_viewport_editor";
import { LayoutViewport } from "../../layout_viewport";
import { LayoutSelection } from "../../../layout/layout_selection";
import { ControlPointManager } from "./control_points/manager";
import { TransformNode } from "../../../layout/nodes";
import { MoveViewportTool } from "./move_viewport";
import { MoveNodeTool } from "./node_tools/move_node";
import { SelectTool } from "./select";
import { Marker } from "../marker_renderer";
import { Vector } from "../../../util/math";

export class TweakTool extends Tool {
    #selection: LayoutSelection;
    #controlPointManager: ControlPointManager;
    #moveViewportTool: MoveViewportTool;
    #moveNodeTool: MoveNodeTool;
    #selectTool: SelectTool;
    #dragTool: Tool = null;
    
    constructor(viewport: LayoutViewport, selection: LayoutSelection) {
        super(viewport);

        this.#selection = selection;
        this.#controlPointManager = new ControlPointManager(this._viewport as LayoutViewportEditor);
        this.#selection.on("changed", () => { this.#controlPointManager.nodes = selection.get() });

        this.#moveViewportTool = new MoveViewportTool(this._viewport);
        this.#moveNodeTool = new MoveNodeTool(this._viewport);
        this.#selectTool = new SelectTool(this._viewport, this.#selection);
    }

    click(event: CustomEvent): void {
        const controlPoint = this.#controlPointManager.findControlPoint(event.detail.position.viewport);

        if (controlPoint) {
            controlPoint.click(event);
        } else {
            this.#selectTool.click(event);
        }
    }

    startDrag(event: CustomEvent): void {
        const nodes = this._viewport.layout.findNodes(event.detail.position.world);
        const controlPoint = this.#controlPointManager.findControlPoint(event.detail.position.viewport);

        console.log(nodes, controlPoint)

        if (event.detail.shiftKey) {
            this.#dragTool = this.#moveViewportTool;
        } else if (controlPoint) {
            this.#dragTool = controlPoint;
        } else if (nodes.length > 0) {
            this.#moveNodeTool.node = nodes[0] as TransformNode;
            this.#selection.set(nodes[0]);
            this.#dragTool = this.#moveNodeTool;
        } else {
            this.#dragTool = this.#selectTool;
        }

        this.#dragTool.startDrag(event);
    }

    drag(event: CustomEvent): void {
        console.log("tweak drag")
        if (this.#dragTool === null) {
            return;
        }
        
        this.#dragTool.drag(event);
    }

    endDrag(event: CustomEvent): void {
        this.#dragTool.endDrag(event);
        this.#dragTool = null;
    }

    prepareHover(position: Vector): void {
        //this.#controlPointManager.prepareHover(position);
    }

    get markers(): Marker[] | null {
        let markers = [];

        if (this.#dragTool === this.#selectTool) {
            markers.push(...this.#dragTool.markers);
        }

        markers.push(...this.#controlPointManager.markers);

        return markers;
    }
}