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
      io.to(gameId).emit("chat:game", {
        username: "System",
        message: `${username} has joined the game.`
      });
    });

    socket.on("close-game", (gameId) => {
      io.to(gameId).emit("gameClosed");
      // Optionally, you can also remove all sockets from the room or perform cleanup here
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
