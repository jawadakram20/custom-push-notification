import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("A new client connected");

  ws.on("message", (message) => {
    console.log("Received: %s", message);
  });

  ws.send("Welcome to the WebSocket server");
});

const broadcastToClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};

export { broadcastToClients };
