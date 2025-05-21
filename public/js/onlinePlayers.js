window.socket = window.socket || io();

document.addEventListener("DOMContentLoaded", () => {
  const onlinePlayersList = document.getElementById("online-players-list");
  const onlineCount = document.getElementById("online-count");

  window.socket.on("online_users_update", (users) => {
    onlineCount.textContent = users.length;

    onlinePlayersList.innerHTML = "";

    users.forEach((user) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "player";
      playerDiv.textContent = user.username;
      onlinePlayersList.appendChild(playerDiv);
    });
  });

  window.socket.emit("get_online_users");
});
