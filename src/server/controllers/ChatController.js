export function handleLobbyChat(io) {
  return (req, res) => {
    const message = req.body.message;
    const username = req.session.username || "anonymous";

    console.log("[Lobby Chat] ${username}: ${message}");

    io.emit("chat:lobby", { username, message });
    res.sendStatus(200);
  };
}

export function handleGameChat(io) {
  return (req, res) => {
    const message = req.body.message;
    const gameId = req.params.gameId;
    const username = req.session.username || "anonymous";

    console.log(`[Game ${gameId} Chat] ${username}: ${message}`);

    io.to(gameId).emit("chat:game", { username, message });
    res.sendStatus(200);
  };
}
