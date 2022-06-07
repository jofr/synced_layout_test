import { SceneGraph, SceneGraphNode } from "../scene_graph/scene_graph";
import { AutomergeSceneGraph } from "../scene_graph/automerge_scene_graph";
import { AutomergeSceneGraphSynchronizer } from "../scene_graph/automerge_synchronizer";
import { LocalSceneGraph } from "../scene_graph/local_scene_graph";
import { LayoutData, LayoutNode } from "./nodes";
import { Root } from "./nodes/root";
import { Binding } from "./nodes/binding";
import { Page } from "./nodes/page";
import { Transform } from "./nodes/transform";
import { Group } from "./nodes/group";
import { Rectangle } from "./nodes/rectangle";
import { Circle } from "./nodes/circle";
import { Ellipse } from "./nodes/ellipse";
import { BoundingRectangle, Vector } from "../util/math";

export type UUID = string;

export type LayoutSceneGraph = SceneGraph;

export class Layout {
    #sceneGraph: LayoutSceneGraph;

    constructor(documentId?: string) {
        if (!documentId) {
            this.#sceneGraph = new AutomergeSceneGraph(new Root({ }));
        } else {
            this.#sceneGraph = new AutomergeSceneGraph(documentId);
        }
        this.#sceneGraph.addSystem(new AutomergeSceneGraphSynchronizer());
    }

    static mainType(node: LayoutNode): string {
        return node.type[node.type.length - 1];
    }

    static isType(node: LayoutNode, type: string): boolean {
        return node.type.includes(type);
    }

    static boundingRectangle(node: LayoutNode): BoundingRectangle {
        const boundingRectangle = {
            "Page": Page.boundingRectangle,
            "Rectangle": Rectangle.boundingRectangle,
            "Circle": Circle.boundingRectangle,
            "Ellipse": Ellipse.boundingRectangle
        };
        const type = this.mainType(node);

        return (type in boundingRectangle) ? boundingRectangle[type](node) : null;
    }

    static isPointInside(node: LayoutNode, point: Vector): boolean {
        const isPointInside = {
            "Rectangle": Rectangle.isPointInside,
            "Circle": Circle.isPointInside,
            "Ellipse": Ellipse.isPointInside
        };
        const type = this.mainType(node);

        return (type in isPointInside) ? isPointInside[type](node, point) : null;
    }

    createNode(data: LayoutData, parent?: LayoutNode): LayoutNode {
        const parentNodeId = parent === undefined ? this.#sceneGraph.rootNodeId : parent.id;
        return this.#sceneGraph.createNode(data, parentNodeId) as LayoutNode;
    }

    removeNode(node: LayoutNode): void {
        this.#sceneGraph.removeNode(node.id);
    }

    reparentNode(node: LayoutNode, newParent: LayoutNode): void {
        this.#sceneGraph.reparentNode(node.id, newParent.id);
    }

    moveNodeBefore(node: LayoutNode, beforeNode: LayoutNode): void {
        this.#sceneGraph.moveNodeBefore(node.id, beforeNode.id);
    }

    moveNodeAfter(node: LayoutNode, afterNode: LayoutNode): void {
        this.#sceneGraph.moveNodeAfter(node.id, afterNode.id);
    }

    groupNodes(nodes: LayoutNode[]): LayoutNode {
        let parentNode = null;
        let sameLevel = true;
        for (const node of nodes) {
            if (parentNode == null) {
                parentNode = node.parent;
            } else if (node.parent != parentNode) {
                sameLevel = false;
            }
        }

        if (parentNode && sameLevel) {
            const groupNode = this.createNode(new Group({}), parentNode);
            for (const node of nodes) {
                this.reparentNode(node, groupNode);
            }
            return groupNode;
        } else {
            return null;
        }
    }

    ungroupNode(node: LayoutNode): void {
        if (!Layout.isType(node, "Group")) {
            return;
        }

        const parentNode = (node.parent || this.#sceneGraph.rootNode) as LayoutNode;
        for (const child of node.children) {
            this.reparentNode(child as LayoutNode, parentNode);
        }
        this.removeNode(node);
    }

    bringToFront(node: LayoutNode): void {

    }

    bringForward(node: LayoutNode): void {

    }

    sendToBack(node: LayoutNode): void {

    }

    sendBackward(node: LayoutNode): void {
        
    }

    findNodes(where: Vector | BoundingRectangle = null): LayoutNode[] {
        let point = where instanceof Vector ? where : null;
        let rectangle = where instanceof BoundingRectangle ? where : null;

        let nodes = [];
        this.#sceneGraph.traverse(
            (node: SceneGraphNode, context: any) => {
                if (!node.metadata.alignedBoundingRectangle) {
                    return;
                }

                const pointInsideBounding = point && node.metadata.alignedBoundingRectangle.isPointInside(point);
                const boundingInsideRectangle = rectangle && rectangle.isBoundingRectangleInside(node.metadata.alignedBoundingRectangle);
                if (pointInsideBounding || boundingInsideRectangle) {
                    if (Layout.mainType(node as LayoutNode) === "Group") {
                        context.groupNode.nodeId = node.id;
                        context.groupNode.insideAtLeastOneChild = false;
                    } else {
                        if (boundingInsideRectangle) {
                            if (context.groupNode.nodeId !== null) {
                                context.groupNode.insideAtLeastOneChild = true;
                            } else {
                                nodes.push(node);
                            }
                        } else {
                            const localPosition = node.metadata.worldTransform.invert().multiply(point) as Vector;
                            if (Layout.isPointInside(node as LayoutNode, localPosition)) {
                                if (context.groupNode.nodeId !== null) {
                                    context.groupNode.insideAtLeastOneChild = true;
                                } else {
                                    nodes.push(node);
                                }
                            }
                        }
                    }
                }
            },
            (node: SceneGraphNode, context: any) => {
                if (context.groupNode.nodeId !== null && node.id === context.groupNode.nodeId) {
                    if (context.groupNode.insideAtLeastOneChild) {
                        nodes.push(this.#sceneGraph.getNode(context.groupNode.nodeId));
                    }
                    context.groupNode.nodeId = null;
                    context.groupNode.isInside = false;
                }
            },
            this.#sceneGraph.rootNodeId,
            {
                groupNode: {
                    nodeId: null,
                    insideAtLeastOneChild: false
                }
            }
        );
        return nodes;
    }

    get sceneGraph(): LayoutSceneGraph {
        return this.#sceneGraph;
    }

    createTestData(): void {
        let rootNodeId = this.#sceneGraph.rootNodeId;

        let nodeA = this.#sceneGraph.createNode(new Rectangle({
            x: -100,
            y: 100,
            width: 50,
            height: 50,
            fill: "#eeeeee"
        }), rootNodeId);

        let nodeB = this.#sceneGraph.createNode(new Rectangle({
            x: 250,
            y: 250,
            width: 50,
            height: 50,
            fill: "#eeeeee",
            strokeWidth: 1,
            stroke: "#0022ff",
        }), rootNodeId);

        let nodeC = this.#sceneGraph.createNode(new Rectangle({
            x: 150,
            y: 150,
            width: 50,
            height: 50,
            fill: "#00ffff",
            strokeWidth: 15,
            stroke: "#ffff00",
            strokeDasharray: [5, 5],
        }), rootNodeId);

        let nodeD = this.#sceneGraph.createNode(new Circle({
            x: 150,
            y: 250,
            r: 50,
            fill: "#000000"
        }), rootNodeId);

        let nodeE = this.#sceneGraph.createNode(new Circle({
            x: 250,
            y: 150,
            r: 50,
            fill: "#33ff77",
            strokeWidth: 1,
            stroke: "#004477",
            strokeDasharray: [10, 5]
        }), rootNodeId);

        let nodeF = this.#sceneGraph.createNode(new Binding({
            method: "book"
        }), rootNodeId);

        let nodeG1 = this.#sceneGraph.createNode(new Page({
            width: 200,
            height: 200
        }), nodeF);

        let nodeH1 = this.#sceneGraph.createNode(new Circle({
            x: 50,
            y: 0,
            r: 50,
            fill: "#22dd44"
        }), nodeG1);

        let nodeG2 = this.#sceneGraph.createNode(new Page({
            width: 200,
            height: 200
        }), nodeF);

        let nodeH2 = this.#sceneGraph.createNode(new Circle({
            x: 100,
            y: 100,
            r: 50,
            fill: "#ff0044"
        }), nodeG2);

        let nodeG3 = this.#sceneGraph.createNode(new Page({
            width: 200,
            height: 200
        }), nodeF);

        let nodeH3 = this.#sceneGraph.createNode(new Circle({
            x: 50,
            y: 50,
            r: 50,
            fill: "#ffff44"
        }), nodeG3);

        let nodeG4 = this.#sceneGraph.createNode(new Page({
            width: 200,
            height: 200
        }), nodeF);

        let nodeG5 = this.#sceneGraph.createNode(new Page({
            width: 200,
            height: 200
        }), nodeF);

        let nodeI = this.#sceneGraph.createNode(new Circle({
            x: 250,
            y: 150,
            r: 50,
            fill: "#00ff00",
            strokeWidth: 1,
            stroke: "#ff4477",
            strokeDasharray: [10, 5]
        }), rootNodeId);

        let nodeJ = this.#sceneGraph.createNode(new Ellipse({
            x: 450,
            y: 250,
            rx: 50,
            ry: 25,
            fill: "#ffff00",
            strokeWidth: 1,
            stroke: "#ff4477"
        }), rootNodeId);

        let nodeK = this.#sceneGraph.createNode(new Group({
            x: 600,
            y: 600,
            scale: 0.5
        }), rootNodeId);

        let nodeL1 = this.#sceneGraph.createNode(new Rectangle({
            x: 0,
            y: 0,
            width: 200,
            height: 200,
            fill: "#336699",
        }), nodeK);

        let nodeL2 = this.#sceneGraph.createNode(new Rectangle({
            x: 100,
            y: 300,
            width: 200,
            height: 200,
            fill: "#336699",
        }), nodeK);
    }
}