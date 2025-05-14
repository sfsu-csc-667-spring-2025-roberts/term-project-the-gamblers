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

document.getElementById("draw-pile").addEventListener("click", () => {
    window.socket.emit("draw-card", { gameId: window.gameId });
});

document.getElementById("call-uno-btn").addEventListener("click", () => {
    window.socket.emit("call-uno", { gameId: window.gameId });
});

window.socket.on("update-discard", (card) => {
    const discardPile = document.getElementById("discard-pile");
    discardPile.innerText = card.value;
    discardPile.style.backgroundColor = card.color;
});

window.socket.on("turn-update", ({ currentPLayerId }) => {
    const isMyTurn = currentPLayerId === window.userId;
    const turnIndicator = document.getElementById("turn-indicator");
    turnIndicator.innerText = isMyTurn ? "Your Turn" : "Waiting for other player";
});

window.socket.on("gameClosed", () => {
    alert("The game has ended. Returning to lobby.");
    window.location.href = "/lobby";
});

window.socket.on("hand:deal", (data) => {
    renderHand(data.hand);
});

window.socket.on("gameStateUpdate", (gameState) => {
    if (window.userId && gameState.hands) {
        const hand = gameState.hands[window.userId];
        if (hand) {
            renderHand(hand);
        }
    }
});

window.socket.on("player-state", (data) => {
    const { hand, yourTurn, topCard } = data;
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = ""; // Clear previous hand
    hand.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.innerText = card.value;
        cardElement.style.width = "70px";
        cardElement.style.height = "100px";
        cardElement.style.border = "1px solid black";
        cardElement.style.display = "flex";
        cardElement.style.justifyContent = "center";
        cardElement.style.alignItems = "center";
        cardElement.style.margin = "5px";
        cardElement.style.borderRadius = "5px";
        cardElement.style.backgroundColor = card.color === "black" ? "black" : card.color;
        cardElement.style.color = card.color === "black" ? "white" : "black";

        cardElement.addEventListener("click", () => {
            playCard(card);
        });

        handContainer.appendChild(cardElement);
    });
    // Update discard pile
    const discardPile = document.getElementById("discard-pile");
    if(discardPile) discardPile.innerText = '${topCard.color} ${topCard.value}';
    // Update turn indicator
    const turnIndicator = document.getElementById("turn-indicator");
    turnIndicator.innerText = yourTurn ? "Your Turn" : "Waiting for other player";
})

document.addEventListener("DOMContentLoaded", function () {
    if (window.gameId && window.socket) {
        window.socket.emit("join-game", window.gameId);
    } else {
        console.warn("Missing gameId or socket");
    }
});

function renderHand(cards) {
    const handContainer = document.getElementById("player-hand");
    handContainer.innerHTML = ""; // Clear previous hand

    cards.forEach(card => {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card", card.color);
        cardElement.innerText = card.value;
        cardElement.dataset.cardId = card.id;

        cardElement.addEventListener("click", () => {
            playCard(card);
        });

        handContainer.appendChild(cardElement);
    });
}

function playCard(card) {
    let chosenColor = null;

    if (card.color === "black") {
        chosenColor = prompt("Choose a color: red, green, blue, yellow");
    }

    window.socket.emit("play-card", {
        gameId: window.gameId,
        card: card,
        chosenColor: chosenColor
    });
}
