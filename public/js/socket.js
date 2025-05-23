import {
  UNOGame,
  drawCard,
  playCard,
  checkUNO,
  callUNO,
  addPlayer,
  getNextPlayerIndex,
} from "../../src/server/logic/UNOgame.js";
import db from "../../src/db/connection.js";

const activeGames = new Map(); // Map of gameId -> UNOGame instance
const onlineUsers = new Map();

export default function initSocketIO(io, sessionMiddleware) {
  // Wrap session middleware for socket.io
  if (sessionMiddleware) {
    io.use((socket, next) => {
      // Apply session middleware to each socket connection
      sessionMiddleware(socket.request, {}, next);
    });
  }

  io.on("connection", (socket) => {
    // Get session data after the session middleware has been applied
    const session = socket.request.session;

    if (!session) {
      console.log("Warning: No session data available for socket:", socket.id);
      socket.emit("error", {
        message: "Session not available, please log in again",
      });
      return;
    }

    const username = session.username || "anonymous";
    const userId = session.userId || socket.id; // Fallback if no session userId

    // Add user to online users
    onlineUsers.set(userId, { username, socketId: socket.id });

    io.emit("online_users_update", Array.from(onlineUsers.values()));

    socket.on("get_online_users", () => {
      socket.emit("online_users_update", Array.from(onlineUsers.values()));
    });

    console.log(
      `User connected: ${socket.id} as ${username} (userId: ${userId})`,
    );
    console.log(`Session data:`, {
      sessionID: session.id,
      username: session.username,
      userId: session.userId,
    });

    socket.on("join-game", (gameId) => {
      socket.join(gameId);
      console.log(
        `Socket ${socket.id} joined room ${gameId} with userId: ${userId}`,
      );
      io.to(gameId).emit("chat:game", {
        username: "System",
        message: `${username} has joined the game.`,
      });

      const game = activeGames.get(gameId);
      if (game) {
        if (!game.players.some((p) => p.id === userId)) {
          addPlayer(game, { id: userId, username: username });
        }
        socket.emit("player-state", game.getPlayerState(userId));
      }
    });

    socket.on("start-game", async ({ gameId }) => {
      if (activeGames.has(gameId)) {
        return socket.emit("error", { message: "Game already started" });
      }

      try {
        const { rows: gamePlayers } = await db.query(
          `SELECT u.id, u.username 
           FROM game_players gp 
           JOIN users u ON gp.user_id = u.id 
           WHERE gp.game_id = $1`,
          [gameId],
        );

        if (gamePlayers.length < 2) {
          return socket.emit("error", {
            message: "Need at least 2 players to start the game",
          });
        }

        const game = new UNOGame(gameId, gamePlayers);
        await game.initialize();
        activeGames.set(gameId, game);

        io.to(gameId).emit("gameStateUpdate", game.getGameState());

        gamePlayers.forEach((player) => {
          io.of("/").sockets.forEach((s) => {
            if (s.request.session.userId == player.id) {
              s.emit("player-state", game.getPlayerState(player.id));
            }
          });
        });

        io.to(gameId).emit("chat:game", {
          username: "System",
          message: "The game has started! Good luck everyone!",
        });
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("error", { message: "Failed to start game." });
      }
    });

    socket.on("play-card", ({ gameId, card, chosenColor }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      const previousPlayerIndex = game.currentPlayerIndex;
      const result = playCard(game, userId, card, chosenColor);
      if (result?.success) {
        socket.emit("player-state", game.getPlayerState(userId));
        io.to(gameId).emit("gameStateUpdate", game.getGameState());

        if (["draw2", "wild_draw4"].includes(card.value)) {
          const nextPlayerIndex = getNextPlayerIndex(
            previousPlayerIndex,
            game.direction,
            game.players.length,
          );
          console.log("Next player index:", nextPlayerIndex);
          const nextPlayer = game.players[nextPlayerIndex];
          io.of("/").sockets.forEach((s) => {
            if (s.request.session.userId == nextPlayer.id) {
              s.emit("player-state", game.getPlayerState(nextPlayer.id));
            }
          });
        }
      } else {
        socket.emit("error", { message: "Invalid play." });
      }
    });

    socket.on("draw-card", ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      drawCard(game, userId);
      socket.emit("player-state", game.getPlayerState(userId));
      io.to(gameId).emit("gameStateUpdate", game.getGameState());
    });

    socket.on("choose-color", ({ gameId, color }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      game.currentColor = color;
      socket.emit("player-state", game.getPlayerState(userId));
      io.to(gameId).emit("gameStateUpdate", game.getGameState());
    });

    socket.on("call-uno", ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      const player = game.players.find((p) => p.id === userId);
      if (player) {
        const result = callUNO(game, player);

        if (result?.success) {
          socket.emit("player-state", game.getPlayerState(userId));
          io.to(gameId).emit("gameStateUpdate", game.getGameState());
        } else {
          socket.emit("error", { message: "You cannot call UNO right now." });
        }
      }
    });

    socket.on("check-uno", ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) return;

      const player = game.players.find((p) => p.id === userId);
      if (player) {
        const penalty = checkUNO(game, player);
        if (penalty) {
          io.to(gameId).emit("chat:game", {
            username: "System",
            message: `${player.name} did not call UNO! Draw 2 cards!`,
          });
        }
        io.to(gameId).emit("gameStateUpdate", game);
      }
    });

    socket.on("get-game-state", ({ gameId }) => {
      const game = activeGames.get(gameId);
      if (!game) return;
      socket.emit("gameStateUpdate", game);
    });

    socket.on("close-game", (gameId) => {
      activeGames.delete(gameId);
      io.to(gameId).emit("gameClosed");
    });

    socket.on("disconnect", () => {
      console.log(
        `User disconnected: ${socket.id} (userId: ${userId}, username: ${username})`,
      );

      onlineUsers.delete(userId);

      io.emit("online_users_update", Array.from(onlineUsers.values()));
    });
  });
}
