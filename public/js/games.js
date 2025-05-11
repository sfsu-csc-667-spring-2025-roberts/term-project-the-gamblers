
document.getElementById("leave-game-btn").addEventListener("click", () => {
    console.log("leave game button clicked");

    fetch("/games/" + window.gameId + "/leave", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => {
        if (response.ok) {
            window.location.href = "/lobby";
        } else {
            console.error("Failed to leave game");
        }
    });
});

socket.on("gameClosed", () => {
    alert("The game has ended. Returning to lobby.");
    window.location.href = "/lobby";
});
