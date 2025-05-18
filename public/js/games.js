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
        // Treat wild cards as black if color is falsy or 'black'
        const isWild = card.type === "wild" && (!card.color || card.color === "black");
        cardElement.classList.add("card", isWild ? "card-black" : `card-${card.color}`);
        let cardHTML = '';
        if (isWild) {
            if (card.value === "wild_draw4" || card.value === "wildDrawFour" || card.value === "+4" || card.value === "draw4") {
                cardHTML = `<span class='card-wild-label'>WILD</span><span class='card-plus4'>+4</span>`;
            } else {
                cardHTML = `<span class='card-wild-label'>WILD</span>`;
            }
        } else {
            cardHTML = `<span class='card-value'>${card.value}</span>`;
        }
        cardElement.innerHTML = cardHTML;
        cardElement.dataset.cardId = card.id;
        cardElement.addEventListener("click", () => {
            playCard(card);
        });
        handContainer.appendChild(cardElement);
    });
    // Update discard pile
    const discardPile = document.getElementById("discard-pile");
    if (discardPile) discardPile.innerText = `${topCard.color} ${topCard.value}`;
    // Update turn indicator
    const turnIndicator = document.getElementById("turn-indicator");
    turnIndicator.innerText = yourTurn ? "Your Turn" : "Waiting for other player";
});

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
        // Treat wild cards as black if color is falsy or 'black'
        const isWild = card.type === "wild" && (!card.color || card.color === "black");
        cardElement.classList.add("card", isWild ? "card-black" : `card-${card.color}`);
        let cardHTML = '';
        if (isWild) {
            if (card.value === "wild_draw4" || card.value === "wildDrawFour" || card.value === "+4" || card.value === "draw4") {
                cardHTML = `<span class='card-wild-label'>WILD</span><span class='card-plus4'>+4</span>`;
            } else {
                cardHTML = `<span class='card-wild-label'>WILD</span>`;
            }
        } else {
            cardHTML = `<span class='card-value'>${card.value}</span>`;
        }
        cardElement.innerHTML = cardHTML;
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
