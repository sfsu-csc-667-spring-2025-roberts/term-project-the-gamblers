import { sessionMiddleware } from "../server/middleware/session.js";

export default function initSocketIO(io) {
  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on("connection", (socket) => {
    const session = socket.request.session;
    const username = session?.username || "anonymous";

    console.log(`User connected: ${socket.id} as ${username}`);

    socket.on("join-game", (gameId) => {
      socket.join(gameId);
      console.log(`Socket ${socket.id} joined room ${gameId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
