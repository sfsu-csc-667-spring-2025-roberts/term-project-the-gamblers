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
        cardHTML =
          getWildSVG() +
          `<span style='position:absolute;left:50%;top:60%;transform:translate(-50%,-50%);color:#FFD700;font-size:2.2rem;font-family:Arial Black,sans-serif;text-shadow:2px 2px 6px #000;font-weight:bold;'>+4</span>`;
      } else {
        cardHTML = getWildSVG();
      }
      cardElement.innerHTML = cardHTML;
    } else if (
      gameState.topCard.value === "draw2" &&
      gameState.topCard.type === "action"
    ) {
      cardElement.innerHTML = getDraw2SVG(gameState.topCard.color);
    } else if (
      gameState.topCard.value === "skip" &&
      gameState.topCard.type === "action"
    ) {
      cardElement.innerHTML = getSkipSVG(gameState.topCard.color);
    } else if (
      gameState.topCard.value === "reverse" &&
      gameState.topCard.type === "action"
    ) {
      cardElement.innerHTML = getReverseSVG(gameState.topCard.color);
    } else {
      cardElement.classList.add("card", `card-${gameState.topCard.color}`);
      cardElement.innerHTML = `<span class='card-value'>${gameState.topCard.value}</span>`;
    }
    discardPile.appendChild(cardElement);
  }

  // Update draw pile count
  const drawPileCount = document.getElementById("draw-pile-count");
  if (drawPileCount) {
    drawPileCount.textContent = gameState.drawPileCount;
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

  const otherPlayersContainer = document.getElementById("other-players");
  if (otherPlayersContainer) {
    otherPlayersContainer.innerHTML = "";

    gameState.players.forEach((player) => {
      if (String(player.id) !== String(window.userId)) {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player-avatar");

        if (String(player.id) === String(gameState.currentPlayerId)) {
          playerDiv.classList.add("active"); // highlight current player's turn
        }

        playerDiv.innerHTML = `
          <div class="avatar-circle"></div>
          <div class="player-name">${player.name}</div>
          <div class="cards-count">${player.handSize} cards</div>
        `;

        otherPlayersContainer.appendChild(playerDiv);
      }
    });
  }
});

window.socket.on("player-state", (data) => {
  console.log("Received player-state:", {
    yourTurn: data.yourTurn,
    myId: window.userId,
  });

  const { hand, yourTurn, topCard, drawPileCount } = data;
  renderHand(hand);

  // Update draw pile count
  const drawPileCountElement = document.getElementById("draw-pile-count");
  if (drawPileCountElement) {
    drawPileCountElement.textContent = drawPileCount;
  }

  const discardPile = document.getElementById("discard-pile");
  if (discardPile) {
    discardPile.innerHTML = "";
    const cardElement = document.createElement("div");
    if (data.topCard.type === "wild") {
      cardElement.classList.add("card", `card-${data.topCard.color}`);
      let cardHTML = "";
      if (data.topCard.value === "wild_draw4") {
        cardHTML =
          getWildSVG() +
          `<span style='position:absolute;left:50%;top:60%;transform:translate(-50%,-50%);color:#FFD700;font-size:2.2rem;font-family:Arial Black,sans-serif;text-shadow:2px 2px 6px #000;font-weight:bold;'>+4</span>`;
      } else {
        cardHTML = getWildSVG();
      }
      cardElement.innerHTML = cardHTML;
    } else if (
      data.topCard.value === "draw2" &&
      data.topCard.type === "action"
    ) {
      cardElement.innerHTML = getDraw2SVG(data.topCard.color);
    } else if (
      data.topCard.value === "skip" &&
      data.topCard.type === "action"
    ) {
      cardElement.innerHTML = getSkipSVG(data.topCard.color);
    } else if (
      data.topCard.value === "reverse" &&
      data.topCard.type === "action"
    ) {
      cardElement.innerHTML = getReverseSVG(data.topCard.color);
    } else {
      cardElement.classList.add("card", `card-${data.topCard.color}`);
      cardElement.innerHTML = `<span class='card-value'>${data.topCard.value}</span>`;
    }
    cardElement.dataset.cardId = data.topCard.card_id;
    discardPile.appendChild(cardElement);
  }
  const turnIndicator = document.getElementById("turn-indicator");
  if (turnIndicator) {
    if (data.yourTurn) {
      turnIndicator.innerText = "Your Turn";
      turnIndicator.classList.add("your-turn");
    } else {
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
        cardHTML =
          getWildSVG() +
          `<span style='position:absolute;left:50%;top:60%;transform:translate(-50%,-50%);color:#FFD700;font-size:2.2rem;font-family:Arial Black,sans-serif;text-shadow:2px 2px 6px #000;font-weight:bold;'>+4</span>`;
      } else {
        cardHTML = getWildSVG();
      }
    } else if (card.value === "draw2" && card.type === "action") {
      cardHTML = getDraw2SVG(card.color);
    } else if (card.value === "skip" && card.type === "action") {
      cardHTML = getSkipSVG(card.color);
    } else if (card.value === "reverse" && card.type === "action") {
      cardHTML = getReverseSVG(card.color);
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
    back.style.transform = `translate(-50%, -50%) translate(${i * 2}px, ${i * 2}px)`;
    back.style.zIndex = i;
    stack.appendChild(back);
  }

  // Add the counter element
  const counter = document.createElement("div");
  counter.id = "draw-pile-count";
  stack.appendChild(counter);

  drawPile.appendChild(stack);
}

// Returns the SVG string for a draw2 card of the given color
function getDraw2SVG(color) {
  // Map color to SVG fill
  const colorMap = {
    red: "#DA1A28",
    yellow: "#FFD700",
    blue: "#1C75BC",
    green: "#3CB44B",
  };
  const fill = colorMap[color] || "#DA1A28";
  return `
    <svg width="80" height="120" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="450" rx="30" ry="30" fill="${fill}" stroke="black" stroke-width="4"/>
      <ellipse cx="150" cy="225" rx="125" ry="210" fill="white" stroke="black" stroke-width="4"/>
      <rect x="110" y="170" width="55" height="75" rx="5" ry="5" fill="white" stroke="black" stroke-width="3"/>
      <rect x="130" y="190" width="55" height="75" rx="5" ry="5" fill="white" stroke="black" stroke-width="3"/>
      <text x="20" y="55" font-family="Arial Black, sans-serif" font-size="42" fill="white" stroke="black" stroke-width="2">+2</text>
      <text x="230" y="430" font-family="Arial Black, sans-serif" font-size="42" fill="white" stroke="black" stroke-width="2">+2</text>
    </svg>
  `;
}

// Returns the SVG string for a skip card of the given color
function getSkipSVG(color) {
  const colorMap = {
    red: "#DA1A28",
    yellow: "#FFD700",
    blue: "#1C75BC",
    green: "#3CB44B",
  };
  const fill = colorMap[color] || "#DA1A28";
  return `
    <svg width="80" height="120" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="450" rx="30" ry="30" fill="${fill}" stroke="black" stroke-width="4"/>
      <ellipse cx="150" cy="225" rx="125" ry="210" fill="white" stroke="black" stroke-width="4"/>
      <circle cx="150" cy="225" r="50" fill="white" stroke="black" stroke-width="6"/>
      <line x1="115" y1="190" x2="185" y2="260" stroke="black" stroke-width="6"/>
    </svg>
  `;
}

// Returns the SVG string for a reverse card of the given color
function getReverseSVG(color) {
  const colorMap = {
    red: "#DA1A28",
    yellow: "#FFD700",
    blue: "#1C75BC",
    green: "#3CB44B",
  };
  const fill = colorMap[color] || "#DA1A28";
  return `
    <svg width="80" height="120" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="450" rx="30" ry="30" fill="${fill}" stroke="black" stroke-width="4"/>
      <ellipse cx="150" cy="225" rx="125" ry="210" fill="white" stroke="black" stroke-width="4"/>
      <g transform="translate(150,225) scale(1.2)">
        <path d="M -30 -20 A 35 35 0 0 1 30 -20" fill="none" stroke="black" stroke-width="6" marker-end="url(#arrowhead)"/>
        <path d="M 30 20 A 35 35 0 0 1 -30 20" fill="none" stroke="black" stroke-width="6" marker-end="url(#arrowhead)"/>
      </g>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="black"/>
        </marker>
      </defs>
    </svg>
  `;
}

// Returns the SVG string for a wild card
function getWildSVG() {
  return `
    <svg width="80" height="120" viewBox="0 0 300 450" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="450" rx="30" ry="30" fill="black" stroke="white" stroke-width="4"/>
      <ellipse cx="150" cy="225" rx="125" ry="210" fill="white" stroke="black" stroke-width="4"/>
      <defs>
        <clipPath id="ovalClip">
          <ellipse cx="150" cy="225" rx="80" ry="130"/>
        </clipPath>
      </defs>
      <g clip-path="url(#ovalClip)">
        <rect x="70" y="95" width="80" height="130" fill="#DA1A28"/>
        <rect x="150" y="95" width="80" height="130" fill="#FFD700"/>
        <rect x="70" y="225" width="80" height="130" fill="#3CB44B"/>
        <rect x="150" y="225" width="80" height="130" fill="#1C75BC"/>
      </g>
      <ellipse cx="150" cy="225" rx="80" ry="130" fill="none" stroke="black" stroke-width="4"/>
    </svg>
  `;
}
