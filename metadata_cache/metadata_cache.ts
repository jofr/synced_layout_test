import { UUID, SceneGraph, SceneGraphNode, SceneGraphEvent, SceneGraphSystem } from "../scene_graph/scene_graph";
import { LayoutNode } from "../layout/nodes";

export type FilterFunction = (event: SceneGraphEvent) => boolean;

export type CacheFilter = {
    nodeCreated: boolean | FilterFunction;
    nodeMoved: boolean | FilterFunction;
    propertyChanged: boolean | FilterFunction;
}

export class MetadataCache implements SceneGraphSystem {
    #sceneGraph: SceneGraph;
    #filters: CacheFilter;
    #dirtyNodeIds: Set<UUID> = new Set();

    constructor(filters: CacheFilter) {
        this.#filters = filters;
    }

    initialize(sceneGraph: SceneGraph) {
        this.#sceneGraph = sceneGraph;

        const addDirty = (filter: boolean | FilterFunction, event: SceneGraphEvent) => {
            if ((typeof(filter) === "boolean" && filter) || (filter as FilterFunction)(event)) {
                this.#dirtyNodeIds.add(event.nodeId);
                if (event.nodeIds) {
                    for (const id of event.nodeIds) {
                        this.#dirtyNodeIds.add(id);
                    }
                }
            }
        };
        this.#sceneGraph.on("nodeCreated", (event: SceneGraphEvent) => addDirty(this.#filters.nodeCreated, event));
        this.#sceneGraph.on("nodeMoved", (event: SceneGraphEvent) => addDirty(this.#filters.nodeMoved, event));
        this.#sceneGraph.on("propertyChanged", (event: SceneGraphEvent) => addDirty(this.#filters.propertyChanged, event));

        this.#sceneGraph.traverse(
            this.processNode.bind(this),
            this.processNodePost.bind(this),
            this.#sceneGraph.rootNodeId,
            { }
        );
    }

    update(): void {
        if (this.#dirtyNodeIds.size == 0) {
            return;
        }

        for (let nodeId of this.#dirtyNodeIds) {
            this.#sceneGraph.ascend((node: SceneGraphNode) => {
                if (node.id != nodeId && this.#dirtyNodeIds.has(node.id)) {
                    this.#dirtyNodeIds.delete(nodeId);
                }
            }, _ => { }, nodeId);
        }

        for (let nodeId of this.#dirtyNodeIds) {
            this.#sceneGraph.traverse(
                this.processNode.bind(this), 
                this.processNodePost.bind(this),
                nodeId,
                { }
            );
            if (this.#sceneGraph.getNode(nodeId).parent) {
                this.#sceneGraph.ascend( 
                    this.processNodePost.bind(this),
                    () => {},
                    this.#sceneGraph.getNode(nodeId).parent.id
                );
            }
        }

        this.#dirtyNodeIds.clear();
    }

    processNode(node: LayoutNode, context?: any): void { }

    processNodePost(node: LayoutNode, context?: any): void { }
}