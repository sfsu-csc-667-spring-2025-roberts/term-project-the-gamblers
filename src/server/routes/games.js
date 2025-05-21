import express from "express";
import db from "../../db/connection.js"; // Import the database connection

// Import the games module with a different name to avoid conflicts
import { games as gamesDb } from "../../db/index.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const userId = req.session.userId;
  console.log("userId for the owner", userId);
  const { gameName, maxPlayers, visibility, password } = req.body;

  console.log(userId, gameName, maxPlayers, visibility, password);

  if (!gameName || !maxPlayers || !visibility) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const gameId = await gamesDb.createGame(
      gameName,
      maxPlayers,
      visibility,
      password,
      userId,
    );
    console.log(gameId);
    res.redirect(`/games/${gameId}`);
  } catch (error) {
    console.error(error);
    res.redirect("/lobby");
  }
});

router.get("/load-games", async (req, res) => {
  const userId = req.session.userId;
  try {
    // Use the renamed gamesDb instead of games to avoid the naming conflict
    const gamesList = await gamesDb.getGames(userId);
    console.log(gamesList);
    res.json(gamesList);
  } catch (error) {
    console.error("Error loading games:", error);
    res.status(500).json({ error: "Failed to load games" });
  }
});

router.get("/:gameId", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.session.userId;
    const game = await gamesDb.getGameById(gameId);

    if (!game) {
      return res.status(404).send("Game not found");
    }

    const isHost = game.owner_id === userId;

    res.render("games/game", {
      gameId: gameId,
      username: req.session.username,
      userId: userId,
      isHost: isHost,
    });
  } catch (error) {
    console.error("Error loading game:", error);
    res.status(500).send("Error loading game");
  }
});

// Add a route to handle joining games
router.post("/:gameId/join", async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.session.userId;
    const { password } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to join a game",
      });
    }

    // Fetch the game to check if it exists
    const game = await gamesDb.getGameById(gameId);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: "Game not found" });
    }

    const joinResult = await gamesDb.joinGame(gameId, userId, password || "");
    if (joinResult) {
      return res.json({ success: true, message: "Joined game successfully" });
    } else {
      // Could be already joined, full, or wrong password
      const alreadyJoined = await db.query(
        "SELECT 1 FROM game_players WHERE game_id = $1 AND user_id = $2",
        [gameId, userId],
      );
      if (alreadyJoined.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: "You have already joined this game",
        });
      }
      const playerCount = await db.query(
        "SELECT COUNT(*) FROM game_players WHERE game_id = $1",
        [gameId],
      );
      const maxPlayers = game.max_players;
      if (parseInt(playerCount.rows[0].count) >= maxPlayers) {
        return res
          .status(403)
          .json({ success: false, message: "Game is full" });
      }
      if (game.password && (!password || password !== game.password)) {
        return res
          .status(403)
          .json({ success: false, message: "Incorrect password" });
      }
      return res
        .status(400)
        .json({ success: false, message: "Could not join game" });
    }
  } catch (error) {
    console.error("Error joining game:", error);
    res.status(500).json({ success: false, message: "Failed to join game" });
  }
});

router.post("/:gameId/delete", async (req, res) => {
  const gameId = req.params.gameId;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("You must be logged in to delete a game.");
  }

  const game = await gamesDb.getGameById(gameId);
  if (!game) {
    return res.status(404).send("Game not found.");
  }

  if (game.owner_id !== userId) {
    return res.status(403).send("You are not authorized to delete this game.");
  }

  try {
    const deleted = await gamesDb.removeGame(gameId, userId);
    if (!deleted) {
      // Not the owner or game not found
      return res
        .status(403)
        .send("You are not authorized to delete this game.");
    }
    res.redirect("/lobby");
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).send("Failed to delete game.");
  }
});

router.post("/:gameId/leave", async (req, res) => {
  const gameId = req.params.gameId;
  const userId = req.session.userId;

  console.log("leaving game", gameId, userId);
  if (!userId) {
    return res.status(401).send("You must be logged in to leave a game.");
  }

  try {
    const game = await gamesDb.getGameById(gameId);
    await gamesDb.leaveGame(gameId, userId);
    if (game && game.owner_id === userId) {
      // If the owner leaves, delete the game
      await gamesDb.removeGame(gameId, userId);
    }
    res.redirect("/lobby");
  } catch (error) {
    console.error("Error leaving game:", error);
    res.status(500).send("Failed to leave game.");
  }
});

// Endpoint for automatic game deletion when game ends
router.post("/:gameId/end", async (req, res) => {
  const gameId = req.params.gameId;

  try {
    // Delete all players from the game
    await db.query("DELETE FROM game_players WHERE game_id = $1", [gameId]);

    // Delete the game itself without checking for owner
    await db.query("DELETE FROM games WHERE game_id = $1", [gameId]);

    res.json({ success: true, message: "Game successfully ended and deleted" });
  } catch (error) {
    console.error("Error ending game:", error);
    res.status(500).json({ success: false, message: "Failed to end game" });
  }
});

export default router;
