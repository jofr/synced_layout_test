import { SceneGraph, SceneGraphSystem } from "./scene_graph";
import { AutomergeSceneGraph, SceneGraphDocument } from "./automerge_scene_graph";
import { UUID } from "./scene_graph";

import * as Automerge from "automerge";
import { io } from "socket.io-client";

export class AutomergeSceneGraphSynchronizer implements SceneGraphSystem {
    #socket = null;
    #sceneGraph: AutomergeSceneGraph = null;
    #syncStates: Map<UUID, Automerge.SyncState> = new Map<UUID, Automerge.SyncState>();
    #generateSyncMessages: boolean = false;

    initialize(sceneGraph: AutomergeSceneGraph) {
        this.#sceneGraph = sceneGraph;

        this.#socket = io("http://galene.jj:3000");
        this.#socket.on("sync", this.#receiveSync.bind(this));
        this.#socket.on("peerList", this.#updatePeerList.bind(this));
        this.#socket.emit("auth", {
            from: this.#sceneGraph.actorId
        });
        this.#socket.emit("haveSceneGraph", {
            from: this.#sceneGraph.actorId,
            id: this.#sceneGraph.documentId
        });

        setInterval(() => {
            this.#socket.emit("getPeers", {
                from: this.#sceneGraph.actorId,
                id: this.#sceneGraph.documentId
            });

            for (const peerId of this.#syncStates.keys()) {
                this.#sendSync(peerId);
            }
        }, 1000);
    }

    #receiveSync(message: any): void {
        if (!this.#syncStates.has(message.from)) {
            this.#syncStates.set(message.from, Automerge.initSyncState());
        }

        let sceneGraphPatch = null;
        this.#sceneGraph._updateAutomergeDocument((document: SceneGraphDocument) => {
            const [nextDocument, nextSyncState, patch] = Automerge.receiveSyncMessage(
                document as Automerge.FreezeObject<SceneGraphDocument>,
                this.#syncStates.get(message.from),
                new Uint8Array(message.syncMessage) as Automerge.BinarySyncMessage
            );

            sceneGraphPatch = patch;
            this.#syncStates.set(message.from, nextSyncState);
            return nextDocument;
        });

        let nodeIds = [];
        const changes = sceneGraphPatch?.diffs?.props?.nodes;
        if (changes) {
            for (const change in changes) {
                for (const id in changes[change].props) {
                    nodeIds.push(id);
                }
            }
        }
        if (nodeIds.length > 0) {
            this.#sceneGraph.emit("nodeCreated", {
                type: "nodeCreated",
                nodeId: nodeIds[0],
                nodeIds: nodeIds
            });
        }

        this.#generateSyncMessages = true;
    }

    #sendSync(peerId: UUID): void {
        const [nextSyncState, syncMessage] = Automerge.generateSyncMessage(
            this.#sceneGraph._getAutomergeDocument(),
            this.#syncStates.get(peerId)
        );

        this.#syncStates.set(peerId, nextSyncState);
        if (syncMessage) {
            this.#socket.emit("sync", {
                from: this.#sceneGraph.actorId,
                to: peerId,
                syncMessage: syncMessage
            });
        }
    }

    #updatePeerList(message: any): void {
        for (const peerId of message.peers) {
            if (!this.#syncStates.has(peerId) && peerId != this.#sceneGraph.actorId) {
                this.#syncStates.set(peerId, Automerge.initSyncState());
            }
        }
    }

    update(): void {
        if (this.#generateSyncMessages) {
            this.#generateSyncMessages = false;

            for (const peerId of this.#syncStates.keys()) {
                this.#sendSync(peerId);
            }
        }
    }

    get peerList(): UUID[] {
        return Array.from(this.#syncStates.keys());
    }
}