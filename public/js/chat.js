window.socket = window.socket || io();
const username = window.username || "anonymous";

const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  try {
    await fetch("/chat/lobby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    input.value = "";
  } catch (err) {
    console.error("Failed to send message:", err);
  }
});

window.socket.on("chat:lobby", (data) => {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = `${data.username}: ${data.message}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
