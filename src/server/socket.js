import { sessionMiddleware } from "../server/middleware/session.js";

export default function initSocketIO(io) {
    io.use((socket, next) => {
      sessionMiddleware(socket.request, {}, next);
    });
  
    io.on("connection", (socket) => {
      const session = socket.request.session;
      console.log("User connected:", socket.id);
      console.log("Session data:", session.id);
  
      socket.on("chat message", (msg) => {
        const username = session?.user?.username || "anonymous";
        console.log(`${username} says: ${msg}`);
        io.emit("chat message", `${username}: ${msg}`);
      });
  
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }