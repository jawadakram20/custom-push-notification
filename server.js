import { createServer } from "http";
import { WebSocketServer } from "ws";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const server = createServer((req, res) => {
  handle(req, res);
});

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (socket) => {
  console.log("New WebSocket connection");

  socket.on("message", (message) => {
    console.log("Received message:", message);
  });

  socket.on("close", () => {
    console.log("WebSocket connection closed");
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

app.prepare().then(() => {
  server.listen(3001, (err) => {
    if (err) throw err;
    console.log("WebSocket server is running on ws://localhost:3001");
  });
});
