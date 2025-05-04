import express from "express";

// Import the games module with a different name to avoid conflicts
import { games as gamesDb } from "../../db/index.js";

const router = express.Router();

router.post("/create", async (req, res) => {
    const userId = req.session.userId;
    console.log(req.session.userId);
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
    try {
        // Use the renamed gamesDb instead of games to avoid the naming conflict
        const gamesList = await gamesDb.getGames();
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

        if (!userId) {
            return res.status(401).json({ success: false, message: "You must be logged in to join a game" });
        }

        res.json({ success: true, message: "Joined game successfully" });
    } catch (error) {
        console.error("Error joining game:", error);
        res.status(500).json({ success: false, message: "Failed to join game" });
    }
});

export default router;