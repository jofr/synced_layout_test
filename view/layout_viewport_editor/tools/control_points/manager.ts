import { EditorEvent, LayoutViewportEditor } from "../../layout_viewport_editor";
import { Layout } from "../../../../layout/layout";
import { CircleNode, EllipseNode, LayoutNode, PathNode, PathPointNode, RectangleNode } from "../../../../layout/nodes";
import { ControlPoint } from "./control_point";
import { SizeControlPoint } from "./size";
import { RadiusControlPoint } from "./radius";
import { RotationControlPoint } from "./rotation";
import { Marker } from "../../marker_renderer";
import { Vector } from "../../../../util/math";
import { SceneGraph, SceneGraphSystem } from "../../../../scene_graph/scene_graph";
import { LayoutViewport } from "../../../layout_viewport";

class ControlPointsMetadataCache implements SceneGraphSystem {
    #controlPointManager: ControlPointManager;
    #viewport: LayoutViewport;

    constructor(manager: ControlPointManager, viewport: LayoutViewport) {
        this.#controlPointManager = manager;
        this.#viewport = viewport;
    }

    initialize(sceneGraph: SceneGraph): void {
        this.update();
    }

    #calculateViewportBoundingRectangle(node: LayoutNode): void {
        const metadata = node.metadata.controlPoints;
        if (node.metadata.boundingRectangle) {
            metadata.boundingRectangle = node.metadata.boundingRectangle.transform(this.#viewport.transform);
            metadata.center = metadata.boundingRectangle.tl.add(metadata.boundingRectangle.br).divide(2.0);
            metadata.top = metadata.boundingRectangle.tl.add(metadata.boundingRectangle.tr).divide(2.0);
            metadata.right = metadata.boundingRectangle.tr.add(metadata.boundingRectangle.br).divide(2.0);
            metadata.bottom = metadata.boundingRectangle.bl.add(metadata.boundingRectangle.br).divide(2.0);
            metadata.left = metadata.boundingRectangle.tl.add(metadata.boundingRectangle.bl).divide(2.0);
        }
    }

    update(): void {
        for (const node of this.#controlPointManager.nodes) {
            if (!node.metadata.controlPoints) {
                node.metadata.controlPoints = { };
            }
            this.#calculateViewportBoundingRectangle(node);
        }
    }
}

export class ControlPointManager {
    #editor: LayoutViewportEditor;
    #nodes: LayoutNode[] = [];
    #controlPoints: ControlPoint[] = [];
    #hoveredControlPoint: ControlPoint = null;
    
    constructor(editor: LayoutViewportEditor) {
        this.#editor = editor;

        this.#editor.sceneGraph.addSystem(new ControlPointsMetadataCache(this, this.#editor));

        this.#editor.addEventListener("move", this.#findHoveredControlPoint.bind(this));
    }

    #findHoveredControlPoint(event: EditorEvent) {
        this.#hoveredControlPoint = this.findControlPoint(event.position.viewport);
    }

    #createNodeControlPoints(node: LayoutNode): ControlPoint[] {
        let controlPoints = [];

        if (Layout.isType(node, "Transform")) {
            const rotation = new RotationControlPoint(this.#editor, node as CircleNode);
            this.#controlPoints.push(rotation);
        }

        if (Layout.isType(node, "Circle")) {
            const r = new RadiusControlPoint(this.#editor, node as CircleNode, "r");
            this.#controlPoints.push(r);
        } else if (Layout.isType(node, "Ellipse")) {
            const rx = new RadiusControlPoint(this.#editor, node as EllipseNode, "rx");
            this.#controlPoints.push(rx);

            const ry = new RadiusControlPoint(this.#editor, node as EllipseNode, "ry");
            this.#controlPoints.push(ry);
        } else if (Layout.isType(node, "Rectangle")) {
            const tl = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(-1, -1));
            this.#controlPoints.push(tl);

            const t = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(0, -1));
            this.#controlPoints.push(t);
            
            const tr = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(1, -1));
            this.#controlPoints.push(tr);
            
            const r = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(1, 0));
            this.#controlPoints.push(r);
            
            const br = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(1, 1));
            this.#controlPoints.push(br);
            
            const b = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(0, 1));
            this.#controlPoints.push(b);
            
            const bl = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(-1, 1));
            this.#controlPoints.push(bl);
            
            const l = new SizeControlPoint(this.#editor, node as RectangleNode, new Vector(-1, 0));
            this.#controlPoints.push(l);
        } else if (Layout.isType(node, "Path")) {
            for (let child of (node as PathNode).children) {
                let point = child as PathPointNode;
                let control = new PathPointControlPoint(this.#editor, node as PathPointNode);
                this.#controlPoints.push(control);
            }
        }

        return controlPoints;
    }

    #createControlPoints(): void {
        for (const node of this.#nodes) {
            this.#controlPoints.push(...this.#createNodeControlPoints(node));
        }
    }

    findControlPoint(position: Vector): ControlPoint | null {
        for (const controlPoint of this.#controlPoints) {
            if (controlPoint.isPointInside(position) !== false) {
                return controlPoint;
            }
        }
        return null;
    }

    set nodes(nodes: LayoutNode[]) {
        nodes = nodes ? nodes : [];
        this.#nodes = nodes;

        this.#controlPoints = [];
        if (this.#nodes.length > 0) {
            //this.#updateMetadata();
            this.#createControlPoints();
        }
    }

    get nodes() {
        return this.#nodes;
    }

    get markers(): Marker[] {
        let markers = [];

        for (const controlPoint of this.#controlPoints) {
            const controlPointMarkers = controlPoint.markers;
            if (controlPoint === this.#hoveredControlPoint) {
                for (const marker of controlPointMarkers) {
                    marker.hovered = true;
                }
            }
            markers.push(...controlPointMarkers);
        }

        return markers;
    }
}