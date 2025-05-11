window.socket = window.socket || io();
const username = window.username || "anonymous";
const gameId = window.gameId;

document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    try {
      if (gameId) {
        await fetch(`/chat/${gameId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });
      } else {
        await fetch("/chat/lobby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        });
      }
      input.value = "";
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  });

  if (gameId) {
    console.log("[chat.js] Setting up chat:game handler");
    window.socket.on("chat:game", (data) => {
      console.log("[chat.js] Received chat:game:", data);
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${data.username}: ${data.message}`;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } else {
    console.log("[chat.js] Setting up chat:lobby handler");
    window.socket.on("chat:lobby", (data) => {
      console.log("[chat.js] Received chat:lobby:", data);
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${data.username}: ${data.message}`;
      chatBox.appendChild(msgDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  }
});
