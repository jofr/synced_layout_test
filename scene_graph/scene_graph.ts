import { Events } from "../util/events";

export type UUID = string;

export interface SceneGraphNode {
    id: UUID;
    parent: SceneGraphNode;
    children: SceneGraphNode[];
    metadata: any;
}

export type SceneGraphEvent = {
    type: "nodeCreated" | "nodeMoved" | "propertyChanged" | string;
    nodeId: UUID;
    nodeIds: UUID[];
    property?: string;
}

export enum TraversalCommand {
    StopDescend, StopAscend
}

export type TraversalFunction = (node: SceneGraphNode, context?: any) => void | TraversalCommand;

export interface SceneGraph extends Events {
    rootNodeId: UUID | null;
    rootNode: SceneGraphNode | null;
    actorId: UUID;
    documentId: UUID | null;

    createNode(data: any, parentNode?: UUID | SceneGraphNode): SceneGraphNode;
    reparentNode(node: UUID | SceneGraphNode, newParentNode?: UUID | SceneGraphNode): void;
    moveNodeBefore(node: UUID | SceneGraphNode, beforeNode: UUID | SceneGraphNode): void;
    moveNodeAfter(node: UUID | SceneGraphNode, afterNode: UUID | SceneGraphNode): void;
    removeNode(node: UUID | SceneGraphNode): void;
    getNode(nodeId: UUID): SceneGraphNode;

    addSystem(system: SceneGraphSystem): void;
    update(): void;
    traverse(pre: TraversalFunction, post?: TraversalFunction, startNode?: UUID | SceneGraphNode, context?: any): void;
    ascend(pre: TraversalFunction, post?: TraversalFunction, startNode?: UUID | SceneGraphNode, context?: any): void;
}

export interface SceneGraphSystem {
    initialize(sceneGraph: SceneGraph): void;
    update(): void;
}