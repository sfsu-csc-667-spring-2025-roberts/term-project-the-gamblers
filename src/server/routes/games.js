import express from "express";

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
        const gameId = await gamesDb.createGame(gameName, maxPlayers, visibility, password, userId);
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

router.get("/:gameId", (req, res) => {
    console.log(req.params);
    console.log(req.session.username);
    res.render("games/game", { gameId: req.params.gameId, username: req.session.username });
});

// Add a route to handle joining games
router.post("/:gameId/join", async (req, res) => {
    try {
        const gameId = req.params.gameId;
        const userId = req.session.userId;
        const { password } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "You must be logged in to join a game" });
        }

        // Fetch the game to check the password
        const game = await gamesDb.getGameById(gameId);
        if (!game) {
            return res.status(404).json({ success: false, message: "Game not found" });
        }

        if (game.password) {
            // If a password is set, check it
            if (!password || password !== game.password) {
                return res.status(403).json({ success: false, message: "Incorrect password" });
            }
        }

        await gamesDb.joinGame(gameId, userId);
        res.json({ success: true, message: "Joined game successfully" });
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
            return res.status(403).send("You are not authorized to delete this game.");
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
        if (game && game.owner_id === userId) {
            // If the owner is leaving, delete the game (and all players)
            await gamesDb.removeGame(gameId, userId);
            // Emit 'gameClosed' to all sockets in the game room
            const io = req.app.get('io');
            if (io) {
                io.to(gameId).emit('gameClosed');
            }
        } else {
            // Otherwise, just remove the player from the game
            await gamesDb.leaveGame(gameId, userId);
        }
        res.redirect("/lobby");
    } catch (error) {
        console.error("Error leaving game:", error);
        res.status(500).send("Failed to leave game.");
    }
});

export default router;