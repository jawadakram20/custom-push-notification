import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "todos.json");

export async function GET() {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return new Response(data, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch todos" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const { task } = await req.json();
    const data = await fs.readFile(filePath, "utf8");
    const todos = JSON.parse(data);

    const newTodo = {
      id: Date.now(),
      task,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    todos.push(newTodo);
    // await fs.writeFile(filePath, JSON.stringify(todos, null, 2), "utf8");

    return new Response(JSON.stringify(newTodo), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to add todo" }), {
      status: 500,
    });
  }
}
