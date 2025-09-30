// @ts-check
import { WebSocketServer } from "ws";

const server = new WebSocketServer({
  port: 8081,
});

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (msg) => {
    /**
     * @type {import('./message').Message}
     */
    const message = JSON.parse(msg.toString());
    console.log(`Received: ${message}`);
    socket.send(
      JSON.stringify({ action: "ack", payload: { received: message } })
    );
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
