"use client";

import { useState, useEffect } from "react";
import "./globals.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editTask, setEditTask] = useState("");
  const [editId, setEditId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [previousTodos, setPreviousTodos] = useState([]);
  const [newTodos, setNewTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("/api/todos");
        if (!response.ok) {
          throw new Error(`Failed to fetch todos. Status: ${response.status}`);
        }
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        setTodos(data);

        if (previousTodos.length > 0) {
          const hasChanges =
            JSON.stringify(data) !== JSON.stringify(previousTodos);

          if (hasChanges) {
            console.log("Todos updated!");
          }
        }
        setNewTodos(data);
      } catch (error) {
        console.log(`Error fetching todos: ${error.message}`);
      }
    };

    fetchTodos();

    const interval = setInterval(fetchTodos, 5000);

    return () => clearInterval(interval);
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo. Status: ${response.status}`);
      }

      const newTodo = await response.json();
      setTodos((prevTodos) => [...prevTodos, newTodo]);
      setTask("");
    } catch (error) {
      console.log(`Error adding todo: ${error.message}`);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete todo. Status: ${response.status}`);
      }

      await response.json();
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.log(`Error deleting todo: ${error.message}`);
    }
  };

  const updateTodo = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/todos/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: editTask, completed }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update todo. Status: ${response.status}`);
      }

      const updatedTodo = await response.json();
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      );
      setEditId(null);
      setEditTask("");
      setCompleted(false);
    } catch (error) {
      console.log(`Error updating todo: ${error.message}`);
    }
  };
  useEffect(() => {
    function detectChanges(oldData, newData) {
      newData.forEach((newItem) => {
        const oldItem = oldData.find((item) => item.id === newItem.id);
        if (!oldItem) {
          toast.success(`New Task: ${newItem.task} added.`);
        } else {
          if (oldItem.completed !== newItem.completed) {
            const status = newItem.completed ? "is completed" : "is pending";
            toast.info(`${newItem.task} ${status}.`);
          }
        }
      });

      oldData.forEach((oldItem) => {
        const newItem = newData.find((item) => item.id === oldItem.id);
        if (!newItem) {
          toast.warning(`Task: ${oldItem.task} removed.`);
        }
      });
      setPreviousTodos(newTodos);
    }

    detectChanges(previousTodos, newTodos);
  }, [newTodos]);

  return (
    <div>
      <h1>Welcome to the Todo Observer App</h1>
      <form onSubmit={addTodo}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New task"
        />
        <button type="submit">Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {editId === todo.id ? (
              <div className="list">
                <input
                  type="text"
                  value={editTask}
                  onChange={(e) => setEditTask(e.target.value)}
                />
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                />
                <button onClick={updateTodo}>Update</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </div>
            ) : (
              <div className="list">
                <span>{todo.task}</span>
                <span>{todo.completed ? "completed" : "pending"}</span>
                <button
                  onClick={() => {
                    setEditTask(todo.task);
                    setCompleted(todo.completed);
                    setEditId(todo.id);
                  }}>
                  Edit
                </button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <ToastContainer />
    </div>
  );
}
