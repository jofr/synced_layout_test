const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "http://localhost:1234",
        methods: ["GET", "PUT"]
    }
});

let userSockets = new Map();
let sceneGraphPeers = new Map();

io.on("connection", socket => {
    console.log("New connection established");

    socket.on("auth", msg => {
        console.log(`[${msg.from}] -> auth`);
        userSockets.set(msg.from, socket);
    });

    socket.on("sync", msg => {
        console.log(`[${msg.from}] -> sync (${msg.to})`);
        let recipientSocket = userSockets.get(msg.to);
        if (!recipientSocket) return;
        recipientSocket.emit("sync", {
            from: msg.from,
            to: msg.to,
            syncMessage: msg.syncMessage
        });
    });

    socket.on("getPeers", msg => {
        console.log(`[${msg.from}] -> getPeers (${msg.id})`);
        if (sceneGraphPeers.has(msg.id)) {
            let recipientSocket = userSockets.get(msg.from);
            if (!recipientSocket) return;
            recipientSocket.emit("peerList", {
                id: msg.id,
                peers: sceneGraphPeers.get(msg.id)
            });
            console.log(`[${msg.from}] <- peerList (${sceneGraphPeers.get(msg.id)})`);
        }
    });

    socket.on("haveSceneGraph", msg => {
        console.log(`[${msg.from}] -> haveSceneGraph (${msg.id})`);
        if (!sceneGraphPeers.has(msg.id)) {
            sceneGraphPeers.set(msg.id, []);
        }
        sceneGraphPeers.get(msg.id).push(msg.from);
    });
});

server.listen(3000, _ => {
    console.log('Listen on port 3000');
});