const socket = io();
const chatBox = document.getElementById("chat-box");
const form = document.getElementById("chat-form");
const input = document.getElementById("chat-message");

// Get username from session (set by server)
const username =
  document.getElementById("chat-box").dataset.username || "anonymous";

// Send message on form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (message) {
    socket.emit("chat message", { message, username });
    input.value = "";
  }
});

// Listen for incoming messages
socket.on("chat message", (data) => {
  const msg = document.createElement("div");
  msg.innerText = `[${data.username}]: ${data.message}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
});
