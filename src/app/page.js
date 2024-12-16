"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    socket.onmessage = (event) => {
      console.log("Message from server: ", event.data);
      setMessage(event.data);
      toast.success(event.data);
    };

    setWs(socket);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const addTodo = async () => {
    const requestTime = new Date().toISOString();
    console.log(`API called at: ${requestTime}`);
    setLoading(true);

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to add todo. Status: ${response.status}`);
      }

      const newTodo = await response.json();

      const responseTime = new Date().toISOString();
      console.log(`API response received at: ${responseTime}`);
      console.log("API Response:", newTodo);

      if (ws) {
        ws.send("API response received: Task received successfully");
      }

      toast.success("Successful");
    } catch (error) {
      console.log(`Error adding todo: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Welcome to the Todo App</h1>
      <button onClick={addTodo} disabled={loading}>
        {loading ? "Processing..." : "Call the API"}
      </button>
      {message && <p>{message}</p>}
      <ToastContainer />
    </div>
  );
}
