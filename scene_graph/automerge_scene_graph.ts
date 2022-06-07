import { Events } from "../util/events";
import { UUID, SceneGraph, SceneGraphNode, SceneGraphSystem, TraversalFunction, TraversalCommand } from "./scene_graph";

import * as Automerge from "automerge";

export interface SceneGraphDocument {
    rootNodeId: UUID;
    nodes: Automerge.Table<any>;
}

export class AutomergeSceneGraph extends Events implements SceneGraph {
    #documentId: UUID;
    #document: Automerge.FreezeObject<SceneGraphDocument> = Automerge.init();
    #nodeMetadata: Map<UUID, any> = new Map<UUID, any>();
    #nodeProxies: Map<UUID, any> = new Map<UUID, any>();
    #systems: SceneGraphSystem[] = [];

    constructor(init?: any) {
        super();

        if (typeof(init) == "string") {
            this.#documentId = init;
        } else if (init !== undefined) {
            const rootNodeData = init;
            this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
                document.nodes = new Automerge.Table();
                document.rootNodeId = this.#createNode(document, rootNodeData);
            });
            this.#documentId = this.#document.rootNodeId;
        }
    }

    #createNode(document: SceneGraphDocument, data: any, parentNodeId?: UUID): UUID {
        let node = {...{
            parentNodeIds: [parentNodeId || null],
            childNodeIds: []
        }, ...data};

        const nodeId = document.nodes.add(node);

        if (parentNodeId) {
            let parentNode = document.nodes.byId(parentNodeId);
            if (parentNode) {
                parentNode.childNodeIds.push(nodeId);
            } else {
                console.warn(`Trying to add child node to ${parentNodeId} which does not exist.`);
            }
        }

        return nodeId;
    }

    #removeNode(document: SceneGraphDocument, nodeId: UUID): void {
        let node = document.nodes.byId(nodeId);

        if (!node) {
            console.warn(`Trying to remove node ${nodeId} which does not exist.`);
            return;
        }

        for (let parentNodeId of node.parentNodeIds) {
            let parentNode = document.nodes.byId(parentNodeId);
            if (parentNode) {
                const index = parentNode.childNodeIds.indexOf(nodeId);
                if (index !== -1) {
                    parentNode.childNodeIds.deleteAt(index);
                }
            }
        }
        node.parentNodeIds = [];
    }

    #reparentNode(document: SceneGraphDocument, nodeId: UUID, newParentNodeId: UUID) {
        if (!document.nodes.byId(nodeId) || !document.nodes.byId(newParentNodeId)) {
            console.warn(`Trying to reparent ${nodeId} to ${newParentNodeId} but at least one does not exist.`);
            return;
        }

        this.#removeNode(document, nodeId);

        let node = document.nodes.byId(nodeId);
        let newParentNode = document.nodes.byId(newParentNodeId);
        node.parentNodeIds.push(newParentNodeId);
        newParentNode.childNodeIds.push(nodeId);
    }

    #moveNodeBefore(document: SceneGraphDocument, nodeId: UUID, beforeNodeId: UUID) {
        if (!document.nodes.byId(nodeId) || !document.nodes.byId(beforeNodeId)) {
            console.warn(`Trying to reparent ${nodeId} to ${beforeNodeId} but at least one does not exist.`);
            return;
        }

        if (document.nodes.byId(nodeId).parentNodeIds[0] != document.nodes.byId(beforeNodeId).parentNodeIds[0]) {
            this.#reparentNode(document, nodeId, document.nodes.byId(beforeNodeId).parentNodeIds[0]);
        }


        const parentNode = document.nodes.byId(document.nodes.byId(nodeId).parentNodeIds[0]);
        const nodeIndex = parentNode.childNodeIds.indexOf(nodeId);
        parentNode.childNodeIds.deleteAt(nodeIndex);
        const beforeIndex = parentNode.childNodeIds.indexOf(beforeNodeId);
        parentNode.childNodeIds.insertAt(beforeIndex, nodeId);
    }

    #moveNodeAfter(document: SceneGraphDocument, nodeId: UUID, afterNodeId: UUID) {
        if (!document.nodes.byId(nodeId) || !document.nodes.byId(afterNodeId)) {
            console.warn(`Trying to reparent ${nodeId} to ${afterNodeId} but at least one does not exist.`);
            return;
        }

        if (document.nodes.byId(nodeId).parentNodeIds[0] != document.nodes.byId(afterNodeId).parentNodeIds[0]) {
            this.#reparentNode(document, nodeId, document.nodes.byId(afterNodeId).parentNodeIds[0]);
        }

        const parentNode = document.nodes.byId(document.nodes.byId(nodeId).parentNodeIds[0]);
        const nodeIndex = parentNode.childNodeIds.indexOf(nodeId);
        parentNode.childNodeIds.deleteAt(nodeIndex);
        const afterIndex = parentNode.childNodeIds.indexOf(afterNodeId);
        parentNode.childNodeIds.insertAt(afterIndex === parentNode.childNodeIds.length - 1 ? 0 : afterIndex + 1, nodeId);
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

        this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
            nodeId = this.#createNode(document, data, this.#getNodeId(parentNode));
        });

        this.emit("nodeCreated", {
            type: "nodeCreated",
            nodeId: nodeId,
        });

        return this.getNode(nodeId);
    }

    reparentNode(node: UUID | SceneGraphNode, newParentNode?: UUID | SceneGraphNode): void {
        if (this.#getNodeId(node) == this.#getNodeId(newParentNode)) {
            return;
        }

        this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
            this.#reparentNode(document, this.#getNodeId(node), this.#getNodeId(newParentNode));
        });

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }

    moveNodeBefore(node: string | SceneGraphNode, beforeNode: string | SceneGraphNode): void {
        if (this.#getNodeId(node) == this.#getNodeId(beforeNode)) {
            return;
        }

        this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
            this.#moveNodeBefore(document, this.#getNodeId(node), this.#getNodeId(beforeNode));
        });

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }

    moveNodeAfter(node: string | SceneGraphNode, afterNode: string | SceneGraphNode): void {
        if (this.#getNodeId(node) == this.#getNodeId(afterNode)) {
            return;
        }

        this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
            this.#moveNodeAfter(document, this.#getNodeId(node), this.#getNodeId(afterNode));
        });

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }
    
    removeNode(node: UUID | SceneGraphNode): void {
        this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
            this.#removeNode(document, this.#getNodeId(node));
        });

        this.emit("nodeMoved", {
            type: "nodeMoved",
            nodeId: this.#getNodeId(node),
        });
    }

    getNode(nodeId: UUID): SceneGraphNode {
        if (!this.#document.nodes?.byId(nodeId)) {
            return null;
        }

        const NodeHandler = {
            ownKeys: () => { /* TODO */
                return [...Object.keys(this.#document.nodes.byId(nodeId))];
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
                    const parentNodeIds = this.#document.nodes.byId(target.id).parentNodeIds;
                    if (parentNodeIds.length > 0) {
                        return this.getNode(parentNodeIds[0]);
                    } else {
                        return null;
                    }
                } else if (prop == "children") {
                    let children = [];
                    for (const childNodeId of this.#document.nodes.byId(target.id).childNodeIds) {
                        children.push(this.getNode(childNodeId));
                    }
                    return children;
                } else {
                    return Reflect.get(this.#document.nodes.byId(target.id), prop, receiver);
                }
            },
            
            set: (target, prop, value) => {
                if (["parent", "children"].includes(prop)) {
                    console.warn(`Modifiying parent/children properties of node ${target.id} is not allowed, use appropriate SceneGraph methods instead.`);
                    return false;
                } else {
                    let changed = false;

                    this.#document = Automerge.change(this.#document, (document: SceneGraphDocument) => {
                        let node = document.nodes.byId(target.id);
                        if (node) {
                            node[prop] = value;
                            changed = true;
                        }
                    });

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

    _getAutomergeDocument() {
        return this.#document;
    }

    _updateAutomergeDocument(callback: (document: SceneGraphDocument) => Automerge.FreezeObject<SceneGraphDocument>): void {
        this.#document = callback(this.#document);
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
        return this.#document.rootNodeId;
    }

    get rootNode(): SceneGraphNode | null {
        return this.getNode(this.rootNodeId);
    }

    get actorId(): UUID {
        return Automerge.getActorId(this.#document);
    }

    get documentId(): UUID {
        return this.#documentId;
    }
}