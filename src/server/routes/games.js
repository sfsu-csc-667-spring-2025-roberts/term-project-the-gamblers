import express from "express";

import { games } from "../../db/index.js";

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
        const gameId = await games.createGame(gameName, maxPlayers, visibility, password, userId);
        console.log(gameId);
        res.redirect(`/games/${gameId}`);
    } catch (error) {
        console.error(error);
        res.redirect("/lobby")
        return res.status(500).json({ error: "Failed to create game" });
    }
});

router.get("/:gameId", (req, res) => {
    console.log(req.params);
    res.sendStatus(200);
});

export default router;
