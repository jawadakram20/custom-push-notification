import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "todos.json");

export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    const data = await fs.readFile(filePath, "utf8");
    const todos = JSON.parse(data);

    const filteredTodos = todos.filter((todo) => todo.id !== Number(id));
    if (todos.length === filteredTodos.length) {
      return new Response(JSON.stringify({ error: "Todo not found" }), {
        status: 404,
      });
    }

    await fs.writeFile(
      filePath,
      JSON.stringify(filteredTodos, null, 2),
      "utf8"
    );
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to delete todo" }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    const id = params.id;
    const { task, completed } = await req.json();
    const data = await fs.readFile(filePath, "utf8");
    const todos = JSON.parse(data);

    const todoIndex = todos.findIndex((todo) => todo.id === Number(id));
    if (todoIndex === -1) {
      return new Response(JSON.stringify({ error: "Todo not found" }), {
        status: 404,
      });
    }

    todos[todoIndex] = {
      ...todos[todoIndex],
      task,
      completed,
      updated_at: new Date().toISOString(),
    };

    await fs.writeFile(filePath, JSON.stringify(todos, null, 2), "utf8");
    return new Response(JSON.stringify(todos[todoIndex]), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to update todo" }), {
      status: 500,
    });
  }
}
