import { LayoutViewport } from "../layout_viewport";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators";
import { SceneGraph } from "../../scene_graph/scene_graph";
import { Layout } from "../../layout/layout";
import { LayoutNode } from "../../layout/nodes";
import { BoundingRectangle, Vector } from "../../util/math";
import { ToolManager } from "./tools/manager";

const settings = {
    zoomFactor: 1.0
}

type PointerButtonState = {
    down: boolean,
    drag: boolean
}

type PointerPosition = {
    viewport: Vector,
    world: Vector,
    changedSinceLastFrame: boolean
}

type PointerState = {
    primary: PointerButtonState,
    secondary: PointerButtonState,
    position: PointerPosition,
    pressure: number,
    tangentialPressure: number,
    tiltX: number,
    tiltY: number,
    ctrlKey: boolean,
    shiftKey: boolean,
    altKey: boolean,
    metaKey: boolean
}

export type EditorEventType = "editor:click" | "editor:move" | "editor:dragStart" | "editor:drag" | "editor:dragEnd";

export class EditorEvent {
    type: EditorEventType;
    position: {
        viewport: Vector,
        world: Vector
    };
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
    metaKey: boolean;

    constructor(type: EditorEventType, pointerState: PointerState) {
        this.type = type;
        this.position = {
            viewport: pointerState.position.viewport,
            world: pointerState.position.world
        };
        this.pressure = pointerState.pressure;
        this.tangentialPressure = pointerState.tangentialPressure;
        this.tiltX = pointerState.tiltX;
        this.tiltY = pointerState.tiltY;
        this.ctrlKey = pointerState.ctrlKey;
        this.shiftKey = pointerState.shiftKey;
        this.altKey = pointerState.altKey;
        this.metaKey = pointerState.metaKey;
    }
}

const createEditorEvent = function(type: EditorEventType, pointerState: PointerState) {
    return new CustomEvent(type, {
        detail: {
            position: {
                viewport: pointerState.position.viewport,
                world: pointerState.position.world
            },
            pressure: pointerState.pressure,
            tangentialPressure: pointerState.tangentialPressure,
            tiltX: pointerState.tiltX,
            tiltY: pointerState.tiltY,
            ctrlKey: pointerState.ctrlKey,
            shiftKey: pointerState.shiftKey,
            altKey: pointerState.altKey,
            metaKey: pointerState.metaKey
        }
    });
}

@customElement("layout-viewport-editor")
export class LayoutViewportEditor extends LayoutViewport {
    /*#selection: LayoutSelection = window.selection;
    #pageNodesObserver: NodeObserver = new NodeObserver(this._sceneGraph, "Page");
    #hoveredNode: LayoutNode | null = null;

    #markerRenderer: MarkerRenderer = new MarkerRenderer(this._ctx);*/
    
    #pointer: PointerState = {
        primary: {
            down: false,
            drag: false
        },
        secondary: {
            down: false,
            drag: false
        },
        position: {
            viewport: new Vector(0, 0),
            world: new Vector(0, 0),
            changedSinceLastFrame: false
        },
        pressure: 0.0,
        tangentialPressure: 0.0,
        tiltX: 0.0,
        tiltY: 0.0,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false
    };
    #onPointerUpHandler: EventListener;

    #toolManager: ToolManager = null;

    _beforeComposite() {
        this.#dispatchDragAndMoveEvents();
        /*this.on("beforeComposite", this.#prepareHoveredNodes.bind(this));
        this.on("beforeComposite", this.#renderAxesAndGrid.bind(this));*/
    }

    _afterComposite() {
        /*this.on("afterComposite", this.#renderGuidesAndTools.bind(this));
        this.on("afterComposite", this.#renderDebugInformation.bind(this));*/
    }


    set layout(layout: Layout) {
        super.layout = layout;

        this.#onPointerUpHandler = this.#onPointerUp.bind(this);
        //this._canvasElement.addEventListener("wheel", this.#onWheel.bind(this));
        //this._canvasElement.addEventListener("keydown", this.#onKeyDown.bind(this));

        this.#toolManager = new ToolManager(this);
    }

    get layout() {
        return super.layout;
    }

    #updatePointerState(event: PointerEvent) {
        let position = new Vector(event.offsetX, event.offsetY);
        if (event.target !== this._canvasElement) {
            const canvasBounds = this._canvasElement.getBoundingClientRect();
            position = new Vector(event.clientX - canvasBounds.x, event.clientY - canvasBounds.y); /* assuming border and padding of canvas element is 0 */
        }
        if (position.x !== this.#pointer.position.viewport.x || position.y !== this.#pointer.position.viewport.y) {
            this.#pointer.position.viewport = position;
            this.#pointer.position.world = this.inverseTransform.multiply(position) as Vector;
            this.#pointer.position.changedSinceLastFrame = true;
        }
        this.#pointer.pressure = event.pressure;
        this.#pointer.tangentialPressure = event.tangentialPressure;
        this.#pointer.tiltX = event.tiltX;
        this.#pointer.tiltY = event.tiltY;
        this.#pointer.ctrlKey = event.ctrlKey;
        this.#pointer.shiftKey = event.shiftKey;
        this.#pointer.altKey = event.altKey;
        this.#pointer.metaKey = event.metaKey;
    }

    _onPointerDown(event: PointerEvent): void {
        this.#updatePointerState(event);

        if (event.button == 0) {
            this.#pointer.primary.down = true;
        } else if (event.button == 2) {
            this.#pointer.secondary.down = true;
        }

        document.body.addEventListener("pointerup", this.#onPointerUpHandler);
    }

    _onPointerMove(event: PointerEvent): void {
        if (this.#pointer.primary.down) {
            const isDragStart = !this.#pointer.primary.drag;
            if (isDragStart) {
                this.#pointer.primary.drag = true;
                this.dispatchEvent(createEditorEvent("editor:dragStart", this.#pointer));
            }
        }

        this.#updatePointerState(event);
    }

    #onPointerUp(event: PointerEvent): void {
        this.#updatePointerState(event);

        if (event.button == 0) {
            if (!this.#pointer.primary.drag) {
                this.#pointer.position.changedSinceLastFrame = false;
                this.dispatchEvent(createEditorEvent("editor:click", this.#pointer));
            } else {
                this.#pointer.position.changedSinceLastFrame = false;
                this.#pointer.primary.drag = false;
                this.dispatchEvent(createEditorEvent("editor:dragEnd", this.#pointer));
            }
            this.#pointer.primary.down = false;
        } else if (event.button == 2) {
            this.#pointer.secondary.down = false;
        }

        document.body.removeEventListener("pointerup", this.#onPointerUpHandler);
    }

    _onWheel(event: WheelEvent): void {
        event.preventDefault();

        let delta = event.deltaY;
        if (event.deltaMode == WheelEvent.DOM_DELTA_PIXEL) {
            delta *= settings.zoomFactor / 50;
        } else if (event.deltaMode == WheelEvent.DOM_DELTA_LINE) {
            delta *= settings.zoomFactor / 2.5;
        } else {
            delta *= settings.zoomFactor;
        }

        const minZoom = 0.5 * this._calculateZoomToFit(this._sceneGraph.getNode(this._sceneGraph.rootNodeId) as LayoutNode);

        this.zoom = Math.max(minZoom, this.zoom - delta * this.zoom);
        const viewportWorld = this.#pointer.position.world;
        this.worldX = viewportWorld.x;
        this.worldY = viewportWorld.y;
        const viewportScreen = this.#pointer.position.viewport;
        this.viewportX = viewportScreen.x;
        this.viewportY = viewportScreen.y;
    }

    /*#onKeyDown(event: KeyboardEvent) {
        if (event.code == "Escape") {
            this.#toolManager.abort();
        } else if (event.code == "Delete") {
            this.#selection.remove();
        } else if (event.code == "KeyM") {
            this.#toolManager.createShape("Rectangle");
        } else if (event.code == "KeyO") {
            this.#toolManager.createShape("Circle");
        } else if (event.code == "KeyG") {
            this.#toolManager.moveNode(this.#selection.get()[0] as TransformNode);
        } else if (event.code == "KeyR") {
            this.#toolManager.rotateNode(this.#selection.get()[0] as TransformNode);
        }
    }*/

    #dispatchDragAndMoveEvents() {
         if (this.#pointer.position.changedSinceLastFrame) {
             this.#pointer.position.changedSinceLastFrame = false;
             if (this.#pointer.primary.drag) {
                 this.dispatchEvent(createEditorEvent("editor:drag", this.#pointer));
             } else {
                 this.dispatchEvent(createEditorEvent("editor:move", this.#pointer));
             }
         }
     }

//     #prepareHoveredNodes() {
//         if (this.#hoveredNode !== null) {
//             this.#hoveredNode.metadata.hovered = false;
//         }
//         const nodes = this._layout.findNodes(this.#pointer.position.world);
//         const selection = this.#selection.get();
//         if (nodes.length > 0 && (selection.length === 0 || selection.length > 1 || nodes[0] !== selection[0])) {
//             nodes[0].metadata.hovered = true;
//             this.#hoveredNode = nodes[0];
//         }
//     }

//     #renderAxesAndGrid() {
//         let markers = [];
//         let origin = this.transform.multiply(new Vector(0, 0)) as Vector;
//         if (origin.x > 0 && origin.x < this._canvasElement.width) { /* y axis is visible */
//             markers.push({
//                 type: "LineMarker",
//                 strokeStyle: settings.axesColor,
//                 start: new Vector(origin.x, 0),
//                 end: new Vector(origin.x, this._canvasElement.height)
//             });
//         }
//         if (origin.y > 0 && origin.y < this._canvasElement.height) { /* x axis is visible */
//             markers.push({
//                 type: "LineMarker",
//                 strokeStyle: settings.axesColor,
//                 start: new Vector(0, origin.y),
//                 end: new Vector(this._canvasElement.width, origin.y)
//             });
//         }
//         this.#markerRenderer.renderMarkers(markers);
//     }

//     #renderPageGuides() {
//         let markers = [];
//         for (const page of this.#pageNodesObserver.nodes) {
//             markers.push({
//                 type: "RectangleMarker",
//                 boundingRectangle: page.metadata.boundingRectangle.transform(this.transform)
//             });
//         }
//         this.#markerRenderer.strokeStyle = settings.guideColor;
//         this.#markerRenderer.renderMarkers(markers);
//     }
    
//     #renderSelectionGuides() {
//         const selection = this.#selection.get();
//         if (selection.length > 0) {
//             let selectionMarkers = [];
//             let boundingRectangles = [];
//             for (const node of selection) {
//                 const boundingRectangle = node.metadata.boundingRectangle.transform(this.transform);
//                 selectionMarkers.push({
//                     type: "RectangleMarker",
//                     boundingRectangle: boundingRectangle,
//                     strokeStyle: selection.length > 1 ? settings.subSelectionColor : settings.selectionColor
//                 });
//                 boundingRectangles.push(boundingRectangle);
//             }
//             if (selection.length > 1) {
//                 const enclosingRectangle = BoundingRectangle.AlignedEnclosing(boundingRectangles);
//                 const expanded = new BoundingRectangle(
//                     enclosingRectangle.tl.x - 1,
//                     enclosingRectangle.tl.y - 1,
//                     enclosingRectangle.tr.x - enclosingRectangle.tl.x + 2,
//                     enclosingRectangle.br.y - enclosingRectangle.tr.y + 2
//                 );
//                 selectionMarkers.push({
//                     type: "RectangleMarker",
//                     boundingRectangle: expanded,
//                     strokeStyle: settings.selectionColor
//                 });
//             }
//             this.#markerRenderer.renderMarkers(selectionMarkers);
//         }
//     }

//     #renderGuidesAndTools() {
//         this.#renderPageGuides();
//         this.#renderSelectionGuides();
//         const toolMarkers = this.#toolManager.markers;
//         if (toolMarkers) {
//             this.#markerRenderer.renderMarkers(toolMarkers);
//         }
//     }

//     #renderDebugInformation() {
//         this._ctx.save();
//         this._ctx.font = "20px 'Source Sans Pro'";
//         this._ctx.fillText(this.fps.toFixed(1).toString(), this._canvasElement.width - 40, 20);
//         this._ctx.restore();
//     }

//     get toolManager() {
//         return this.#toolManager;
//     }

//     get pointer() {
//         return this.#pointer;
//     }

//     get selection() {
//         return this.#selection;
//     }
}

declare global {
    interface HTMLElementTagNameMap {
        "layout-viewport-editor": LayoutViewportEditor;
    }
}