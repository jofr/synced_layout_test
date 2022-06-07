import { Events } from "../util/events";
import { UUID, SceneGraph, SceneGraphNode, SceneGraphSystem, TraversalFunction, TraversalCommand } from "./scene_graph";

export class LocalSceneGraph extends Events implements SceneGraph {
    #documentId: UUID;
    #nodes: Map<UUID, any> = new Map<UUID, any>();
    #rootNodeId: UUID;
    #nodeMetadata: Map<UUID, any> = new Map<UUID, any>();
    #nodeProxies: Map<UUID, any> = new Map<UUID, any>();
    #systems: SceneGraphSystem[] = [];
    #uuidCounter: number = 0;

    constructor(init?: any) {
        super();

        if (typeof(init) == "string") {
            console.error("Local scene graph cannot synchronize with existing document");
        } else if (init !== undefined) {
            const rootNodeData = init;
            this.#rootNodeId = this.#createNode(rootNodeData);
            this.#documentId = this.#rootNodeId;
        }
    }

    #createNode(data: any, parentNodeId?: UUID): UUID {
        let node = {...{
            parentNodeIds: [parentNodeId || null],
            childNodeIds: []
        }, ...data};

        const nodeId = (this.#uuidCounter++).toString();
        this.#nodes.set(nodeId, node);

        if (parentNodeId) {
            let parentNode = this.#nodes.get(parentNodeId);
            if (parentNode) {
                parentNode.childNodeIds.push(nodeId);
            } else {
                console.warn(`Trying to add child node to ${parentNodeId} which does not exist.`);
            }
        }

        return nodeId;
    }

    #removeNode(nodeId: UUID): void {
        let node = this.#nodes.get(nodeId);

        if (!node) {
            console.warn(`Trying to remove node ${nodeId} which does not exist.`);
            return;
        }

        for (let parentNodeId of node.parentNodeIds) {
            let parentNode = this.#nodes.get(parentNodeId);
            if (parentNode) {
                const index = parentNode.childNodeIds.indexOf(nodeId);
                if (index !== -1) {
                    parentNode.childNodeIds.deleteAt(index);
                }
            }
        }
        node.parentNodeIds = [];
    }

    #reparentNode(nodeId: UUID, newParentNodeId: UUID) {
        if (!this.#nodes.get(nodeId) || !this.#nodes.get(newParentNodeId)) {
            console.warn(`Trying to reparent ${nodeId} to ${newParentNodeId} but at least one does not exist.`);
            return;
        }

        this.#removeNode(nodeId);

        let node = this.#nodes.get(nodeId);
        let newParentNode = this.#nodes.get(newParentNodeId);
        node.parentNodeIds.push(newParentNodeId);
        newParentNode.childNodeIds.push(nodeId);
    }

    #getNodeId(node: UUID | SceneGraphNode): UUID {
        if (!node) {
            return null;
        }

        if (typeof(node) == "string") {
            return node;
        } else {
            return node.id;
        }
    }
    
    createNode(data: any, parentNode?: UUID | SceneGraphNode): SceneGraphNode {
        let nodeId = "";

        nodeId = this.#createNode(data, this.#getNodeId(parentNode));

        this.emit("nodeCreated", {
            type: "nodeCreated",
            nodeId: nodeId,
        });

        return this.getNode(nodeId);
    }

    reparentNode(node: UUID | SceneGraphNode, newParentNode?: UUID | SceneGraphNode): void {
        this.#reparentNode(this.#getNodeId(node), this.#getNodeId(newParentNode));

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }
    
   
    removeNode(node: UUID | SceneGraphNode): void {
        this.#removeNode(this.#getNodeId(node));

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }

    getNode(nodeId: UUID): SceneGraphNode {
        if (!this.#nodes?.get(nodeId)) {
            return null;
        }

        const NodeHandler = {
            ownKeys: () => { /* TODO */
                return [...Object.keys(this.#nodes.get(nodeId))];
            },

            getOwnPropertyDescriptor: (target, prop) => { /* TODO */
                return {
                    configurable: true,
                    enumerable: true
                }
            },

            get: (target, prop, receiver) => {
                if (prop === "id") {
                    return target.id;
                } else if (prop == "metadata") {
                    if (!this.#nodeMetadata.has(target.id)) {
                        this.#nodeMetadata.set(target.id, { });
                    }
                    return this.#nodeMetadata.get(target.id);
                } else if (prop == "parent") {
                    const parentNodeIds = this.#nodes.get(target.id).parentNodeIds;
                    if (parentNodeIds.length > 0) {
                        return this.getNode(parentNodeIds[0]);
                    } else {
                        return null;
                    }
                } else if (prop == "children") {
                    let children = [];
                    for (const childNodeId of this.#nodes.get(target.id).childNodeIds) {
                        children.push(this.getNode(childNodeId));
                    }
                    return children;
                } else {
                    return Reflect.get(this.#nodes.get(target.id), prop, receiver);
                }
            },
            
            set: (target, prop, value) => {
                if (["parent", "children"].includes(prop)) {
                    console.warn(`Modifiying parent/children properties of node ${target.id} is not allowed, use appropriate SceneGraph methods instead.`);
                    return false;
                } else {
                    let changed = false;

                    let node = this.#nodes.get(target.id);
                    if (node) {
                        node[prop] = value;
                        changed = true;
                    }

                    if (changed) {
                        this.emit("propertyChanged", {
                            nodeId: target.id,
                            property: prop
                        });

                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }

        if (!this.#nodeProxies.has(nodeId)) {
            this.#nodeProxies.set(nodeId, new Proxy({ id: nodeId }, NodeHandler));
        }
        return this.#nodeProxies.get(nodeId);
    }

    addSystem(system: SceneGraphSystem): void {
        system.initialize(this);
        this.#systems.push(system);
    }

    update(): void {
        for (const system of this.#systems) {
            system.update();
        }
    }

    #visitNodeFromTraversal(node: SceneGraphNode, pre: TraversalFunction, post?: TraversalFunction, context?: any): void {
        const command = pre(node, context);

        if (command != TraversalCommand.StopDescend) {
            for (let child of node.children) {
                this.#visitNodeFromTraversal(child, pre, post, context);
            }
        }

        if (post) {
            post(node, context);
        }
    }

    traverse(pre: TraversalFunction, post?: TraversalFunction, startNode?: UUID | SceneGraphNode, context?: any): void {
        let node = this.getNode(this.#getNodeId(startNode)) || this.rootNode;

        if (!node) {
            console.warn(`Scene graph traversal from ${startNode ? startNode : "rootNode"} not possible because it does not exist`);
            return;
        }

        this.#visitNodeFromTraversal(node, pre, post, context);
    }

    #visitNodeFromAscension(node: SceneGraphNode, pre: TraversalFunction, post?: TraversalFunction, context?: any): void {
        const command = pre(node, context);

        if (node.parent && command != TraversalCommand.StopAscend) {
            this.#visitNodeFromAscension(node.parent, pre, post, context);
        }

        if (post) {
            post(node, context);
        }
    }

    ascend(pre: TraversalFunction, post?: TraversalFunction, startNode?: UUID | SceneGraphNode, context?: any): void {
        let node = this.getNode(this.#getNodeId(startNode));

        if (!node) {
            console.warn(`Scene graph ascension from node ${node} not possible because it does not exist.`);
            return;
        }

        this.#visitNodeFromAscension(node, pre, post, context);
    }

    get rootNodeId(): UUID | null {
        return this.#rootNodeId;
    }

    get rootNode(): SceneGraphNode | null {
        return this.getNode(this.rootNodeId);
    }

    get actorId(): UUID {
        return "localActor";
    }

    get documentId(): UUID {
        return this.#documentId;
    }
}