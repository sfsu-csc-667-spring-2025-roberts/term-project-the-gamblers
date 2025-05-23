import express from "express";
import {
  handleLobbyChat,
  handleGameChat,
} from "../controllers/ChatController.js";

export default function chatRoutes(io) {
  const router = express.Router();

  // Handle chat messages in the lobby
  router.post("/lobby", (req, res) => handleLobbyChat(io)(req, res));

  // Handle chat messages in a specific game
  router.post("/:gameId", (req, res) => handleGameChat(io)(req, res));

  return router;
}
