import { WebSocketServer } from "ws";

let todos = [];
const clients = new Set();

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (socket) => {
  clients.add(socket);

  socket.on("close", () => clients.delete(socket));
});

export default async function handler(req, res) {
  const { method, body, query } = req;

  if (method === "GET") {
    return res.status(200).json(todos);
  }

  if (method === "POST") {
    const newTodo = { id: Date.now(), task: body.task, completed: false };
    todos.push(newTodo);
    broadcastChange("add", newTodo, "client");
    return res.status(201).json(newTodo);
  }

  if (method === "DELETE") {
    const todoToDelete = todos.find(
      (todo) => todo.id === parseInt(query.id, 10)
    );
    todos = todos.filter((todo) => todo.id !== parseInt(query.id, 10));
    if (todoToDelete) {
      broadcastChange("delete", todoToDelete, "client");
      return res.status(200).json(todoToDelete);
    }
    return res.status(404).json({ error: "Todo not found" });
  }

  if (method === "PUT") {
    const index = todos.findIndex((todo) => todo.id === parseInt(query.id, 10));
    if (index !== -1) {
      todos[index] = { ...todos[index], ...body };
      broadcastChange("update", todos[index], "client");
    }
    return res.status(200).json(todos[index]);
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}

function broadcastChange(type, data, source) {
  const message = JSON.stringify({ type, data, source });
  for (const client of clients) {
    client.send(message);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

export function setupWebSocket(server) {
  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });
}

export { wss };
