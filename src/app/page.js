"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/todos");
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks);
      }
    } catch {
      toast.error("Failed to fetch tasks");
    }
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/notifications");

    eventSource.onmessage = (event) => {
      const change = JSON.parse(event.data);

      if (change.operationType === "insert") {
        toast.info(`Task added: ${change.fullDocument.task}`);
      } else if (change.operationType === "delete") {
        toast.info("Task removed");
      }

      fetchTasks();
    };

    eventSource.onerror = () => {
      toast.error("Failed to connect to notification stream.");
      eventSource.close();
    };

    fetchTasks();

    return () => {
      eventSource.close();
    };
  }, []);

  const addTodo = async () => {
    setLoading(true);

    if (!task.trim()) {
      toast.error("Please enter a task.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (response.ok) {
        toast.success("Task added successfully");
        setTask("");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast.success("Task deleted successfully");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome to the Todo App</h1>
      <input
        type="text"
        value={task}
        onChange={(e) => setTask(e.target.value)}
        placeholder="Enter a task"
      />
      <button onClick={addTodo} disabled={loading}>
        {loading ? "Processing" : "Add Task"}
      </button>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task) =>
          task && task._id ? (
            <li key={task._id}>
              <span>{task.task}</span>
              <button onClick={() => deleteTodo(task._id)}>Delete</button>
            </li>
          ) : null
        )}
      </ul>
      <ToastContainer />
    </div>
  );
}
