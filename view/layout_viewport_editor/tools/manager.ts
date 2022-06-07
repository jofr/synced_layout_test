import { LayoutViewportEditor } from "../layout_viewport_editor";
import { Tool } from "./tool";
import { TweakTool } from "./tweak";
import { CreateShapeTool } from "./node_tools/create_shape";
import { ChangeRotationTool } from "./node_tools/change_rotation";
import { TransformNode } from "../../../layout/nodes";
import { Marker } from "../marker_renderer";
import { MoveNodeTool } from "./node_tools/move_node";

export class ToolManager {
    #editor: LayoutViewportEditor;

    #activeTool: Tool;
    #tweakTool: TweakTool;
    #createShapeTool: CreateShapeTool;

    constructor(editor: LayoutViewportEditor) {
        this.#editor = editor;

        this.#tweakTool = new TweakTool(this.#editor, window.selection);
        this.#createShapeTool = new CreateShapeTool(this.#editor);
        this.#createShapeTool.on("finished", () => { this.#activeTool = this.#tweakTool; });
        this.#activeTool = this.#tweakTool;

        this.#editor.addEventListener("editor:click", this.#onClick.bind(this));
        this.#editor.addEventListener("editor:dragStart", this.#onDragStart.bind(this));
        this.#editor.addEventListener("editor:drag", this.#onDrag.bind(this));
        this.#editor.addEventListener("editor:dragEnd", this.#onDragEnd.bind(this));
    }

    #onClick(event: CustomEvent): void {
        this.#activeTool.click(event);
    }

    #onDragStart(event: CustomEvent): void {
        this.#activeTool.startDrag(event);
    }

    #onDrag(event: CustomEvent): void {
        this.#activeTool.drag(event);
    }

    #onDragEnd(event: CustomEvent): void {
        this.#activeTool.endDrag(event);
    }

    tweak() {
        this.#activeTool = this.#tweakTool;
    }

    createShape(type: "Rectangle" | "Circle") {
        this.#createShapeTool.type = type;
        this.#activeTool = this.#createShapeTool;
    }

    moveNode(node: TransformNode) {
        this.#activeTool = new MoveNodeTool(this.#editor, node);
        this.#activeTool.on("finished", () => { this.#activeTool = this.#tweakTool; });
    }

    rotateNode(node: TransformNode) {
        this.#activeTool = new ChangeRotationTool(this.#editor, node);
        this.#activeTool.on("finished", () => { this.#activeTool = this.#tweakTool; });
    }

    abort() {
        this.#activeTool.abort();
    }
    
    get markers(): Marker[] {
        return this.#activeTool.markers;
    }
}