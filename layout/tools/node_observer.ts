import { SceneGraph, SceneGraphEvent, SceneGraphNode } from "../../scene_graph/scene_graph";
import { Layout } from "../layout";
import { LayoutNode } from "../nodes";

export class NodeObserver {
    #nodes: Set<LayoutNode>;
    #type: string;

    constructor(sceneGraph: SceneGraph, type: string) {
        this.#nodes = new Set<LayoutNode>();
        this.#type = type;

        sceneGraph.on("nodeCreated", (event: SceneGraphEvent) => {
            if (event.nodeIds) {
                for (const id of event.nodeIds) {
                    this.#addIfType(sceneGraph.getNode(id) as LayoutNode);
                }
            } else {
                this.#addIfType(sceneGraph.getNode(event.nodeId) as LayoutNode);
            }
        });

        sceneGraph.traverse(this.#addIfType.bind(this));
    }

    #addIfType(node: SceneGraphNode): void {
        if (Layout.isType(node as LayoutNode, this.#type)) {
            this.#nodes.add(node as LayoutNode);
        }
    }

    get nodes() {
        return this.#nodes;
    }
}