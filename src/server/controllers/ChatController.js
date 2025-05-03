export function handleLobbyChat(io) {
  return (req, res) => {
    const message = req.body.message;
    const username = req.session.username || "anonymous";

    io.emit("chat:lobby", { username, message });
    res.sendStatus(200);
  };
}
