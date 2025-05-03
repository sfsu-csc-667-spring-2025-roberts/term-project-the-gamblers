import express from "express";
import { handleLobbyChat } from "../controllers/ChatController.js";

export default function chatRoutes(io) {
  const router = express.Router();

  router.post("/lobby", handleLobbyChat(io));

  return router;
}
