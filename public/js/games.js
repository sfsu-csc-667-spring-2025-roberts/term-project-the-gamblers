document.getElementById("leave-game-btn").addEventListener("click", () => {
  console.log("leave game button clicked");

  fetch("/games/" + window.gameId + "/leave", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
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
  console.log("Received gameStateUpdate:", {
    currentPlayerId: gameState.currentPlayerId,
    myId: window.userId,
    players: gameState.players,
  });

  // Update discard pile
  const discardPile = document.getElementById("discard-pile");
  if (discardPile && gameState.topCard) {
    discardPile.innerHTML = "";
    const cardElement = document.createElement("div");
    if (gameState.topCard.type === "wild") {
      cardElement.classList.add("card", `card-${gameState.topCard.color}`);
      let cardHTML = "";
      if (gameState.topCard.value === "wild_draw4") {
        cardHTML = `<span class='card-wild-label'>WILD</span><span class='card-plus4'>+4</span>`;
      } else {
        cardHTML = `<span class='card-wild-label'>WILD</span>`;
      }
      cardElement.innerHTML = cardHTML;
    } else {
      cardElement.classList.add("card", `card-${gameState.topCard.color}`);
      cardElement.innerHTML = `<span class='card-value'>${gameState.topCard.value}</span>`;
    }
    discardPile.appendChild(cardElement);
  }

  // Update turn indicator with the current player's name
  const turnIndicator = document.getElementById("turn-indicator");
  if (turnIndicator) {
    const isMyTurn =
      String(gameState.currentPlayerId) === String(window.userId);
    const currentPlayer = gameState.players.find(
      (p) => String(p.id) === String(gameState.currentPlayerId),
    );
    console.log("Turn check:", {
      currentPlayerId: gameState.currentPlayerId,
      windowUserId: window.userId,
      isMyTurn: isMyTurn,
      currentPlayer: currentPlayer,
    });

    if (isMyTurn) {
      turnIndicator.innerText = "Your Turn";
      turnIndicator.classList.add("your-turn");
    } else {
      turnIndicator.innerText = `Waiting for ${currentPlayer?.name || "Unknown"}'s turn`;
      turnIndicator.classList.remove("your-turn");
    }
  }

  // Optionally update current color display
  const colorIndicator = document.getElementById("current-color");
  if (colorIndicator) {
    colorIndicator.textContent = `Current Color: ${gameState.currentColor}`;
  }
});

window.socket.on("player-state", (data) => {
  console.log("Received player-state:", {
    yourTurn: data.yourTurn,
    myId: window.userId,
  });

  const { hand, yourTurn, topCard } = data;
  renderHand(hand);
  const discardPile = document.getElementById("discard-pile");
  if (discardPile) {
    discardPile.innerHTML = "";
    const cardElement = document.createElement("div");
    if (topCard.type === "wild") {
      cardElement.classList.add("card", `card-${topCard.color}`);
      let cardHTML = "";
      if (topCard.value === "wild_draw4") {
        cardHTML = `<span class='card-wild-label'>WILD</span><span class='card-plus4'>+4</span>`;
      } else {
        cardHTML = `<span class='card-wild-label'>WILD</span>`;
      }
      cardElement.innerHTML = cardHTML;
    } else {
      cardElement.classList.add("card", `card-${topCard.color}`);
      cardElement.innerHTML = `<span class='card-value'>${topCard.value}</span>`;
    }
    cardElement.dataset.cardId = topCard.card_id;
    discardPile.appendChild(cardElement);
  }
  const turnIndicator = document.getElementById("turn-indicator");
  if (turnIndicator) {
    if (yourTurn) {
      turnIndicator.innerText = "Your Turn";
      turnIndicator.classList.add("your-turn");
    } else {
      // Let the gameStateUpdate handle showing whose turn it is
      turnIndicator.innerText = "Waiting for other player's turn";
      turnIndicator.classList.remove("your-turn");
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("Game initialized with:", {
    gameId: window.gameId,
    userId: window.userId,
  });
  if (window.gameId && window.socket) {
    window.socket.emit("join-game", window.gameId);
  } else {
    console.warn("Missing gameId or socket");
  }
});

function renderHand(cards) {
  const handContainer = document.getElementById("player-hand");
  handContainer.innerHTML = "";
  cards.forEach((card) => {
    const cardElement = document.createElement("div");
    const isWild =
      card.type === "wild" && (!card.color || card.color === "black");
    cardElement.classList.add(
      "card",
      isWild ? "card-black" : `card-${card.color}`,
    );
    let cardHTML = "";
    if (isWild) {
      if (card.value === "wild_draw4") {
        cardHTML = `<span class='card-wild-label'>WILD</span><span class='card-plus4'>+4</span>`;
      } else {
        cardHTML = `<span class='card-wild-label'>WILD</span>`;
      }
    } else {
      cardHTML = `<span class='card-value'>${card.value}</span>`;
    }
    cardElement.innerHTML = cardHTML;
    cardElement.dataset.cardId = card.card_id;
    cardElement.addEventListener("click", () => {
      playCard(card);
    });
    handContainer.appendChild(cardElement);
  });
}

function playCard(card) {
  let chosenColor = null;
  if (card.type === "wild" || card.type === "wild_draw4") {
    chosenColor = prompt("Choose a color: red, green, blue, yellow");
    if (!["red", "green", "blue", "yellow"].includes(chosenColor)) {
      alert("Invalid color");
      return;
    }
    chosenColor = chosenColor.toLowerCase();
    window.socket.emit("choose-color", {
      gameId: window.gameId,
      color: chosenColor,
    });
  }
  window.socket.emit("play-card", {
    gameId: window.gameId,
    card: card,
    chosenColor: chosenColor,
  });
}

const drawPile = document.getElementById("draw-pile");
if (drawPile) {
  drawPile.innerHTML = ""; // Clear previous
  const stack = document.createElement("div");
  stack.className = "draw-pile-stack";
  // Show 4 cards in the stack for effect
  for (let i = 0; i < 4; i++) {
    const back = document.createElement("div");
    back.className = "card-back";
    back.style.left = `${i * 4}px`;
    back.style.top = `${i * 2}px`;
    back.style.zIndex = i;
    stack.appendChild(back);
  }
  // Overlay the word "Draw"
  const label = document.createElement("span");
  label.textContent = "Draw";
  label.style.position = "absolute";
  label.style.left = "50%";
  label.style.top = "50%";
  label.style.transform = "translate(-50%, -50%)";
  label.style.color = "#fff";
  label.style.fontWeight = "bold";
  label.style.fontSize = "1.2rem";
  label.style.textShadow = "1px 1px 2px #000";
  stack.appendChild(label);
  drawPile.appendChild(stack);
}
