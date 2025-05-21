// Elements for create game functionality
const createGameButton = document.querySelector("#create-game-btn");
const createGameForm = document.querySelector("#create-game-form-container");
const cancelCreateGameButton = document.querySelector("#cancel-create-game");
const refreshButton = document.querySelector(".refresh-btn");
const filterSelect = document.querySelector(".filter-controls select");
const gameCardsContainer = document.querySelector(".game-cards");

// Create game form visibility toggle
createGameButton?.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("create game button clicked");
  createGameForm?.classList.add("visible");
});

cancelCreateGameButton?.addEventListener("click", (event) => {
  event.preventDefault();
  createGameForm?.classList.remove("visible");
});

// Function to load games with optional filter
const loadGames = async (filter = "All Games") => {
  try {
    gameCardsContainer.innerHTML =
      '<div class="loading">Loading games...</div>';

    const response = await fetch(
      `/games/load-games?filter=${encodeURIComponent(filter)}`,
    );

    if (!response.ok) {
      throw new Error("Failed to load games");
    }

    const games = await response.json();
    console.log("Games loaded:", games);

    // Clear existing content
    gameCardsContainer.innerHTML = "";

    // Handle empty games list
    if (games.length === 0) {
      gameCardsContainer.innerHTML =
        '<div class="no-games">No games available.</div>';
      return;
    }
    // Render each game card
    games.forEach((game) => {
      const gameCard = document.createElement("div");
      gameCard.className = "game-card";

      gameCard.innerHTML = `
        <div class="game-name">${game.game_name}</div>
        <div class="game-info">
          <span class="players">${game.max_players} Players</span>
          <span class="status">${game.visibility}</span>
        </div>
        <button class="join-btn" data-game-id="${game.game_id}">Join Game</button>
      `;

      gameCardsContainer.appendChild(gameCard);
    });

    // Add event listeners to join buttons
    addJoinGameEventListeners();
  } catch (err) {
    console.error("Error loading games:", err);
    gameCardsContainer.innerHTML =
      '<div class="error">Failed to load games. Please try again.</div>';
  }
};

// Function to handle joining a game
const joinGame = async (gameId, visibility) => {
  try {
    console.log(`Joining game with ID: ${gameId}`);
    let password = undefined;
    if (visibility === "private") {
      password = prompt("Enter the password for this private game:");
      if (password === null) return; // User cancelled
    }

    const response = await fetch(`/games/${gameId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin", // Include cookies for authentication
      body: JSON.stringify(password ? { password } : {}),
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to the game page
      window.location.href = `/games/${gameId}`;
    } else {
      alert(data.message || "Failed to join game");
    }
  } catch (error) {
    console.error("Error joining game:", error);
    alert("Failed to join game. Please try again.");
  }
};

// Function to add event listeners to all join buttons
const addJoinGameEventListeners = () => {
  document.querySelectorAll(".join-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const gameId = this.getAttribute("data-game-id");
      // Find the visibility from the card
      const visibility =
        this.closest(".game-card").querySelector(".status").textContent;
      joinGame(gameId, visibility);
    });
  });
};

// Add event listeners for filtering and refreshing
filterSelect?.addEventListener("change", function () {
  loadGames(this.value);
});

refreshButton?.addEventListener("click", () => {
  const filter = filterSelect ? filterSelect.value : "All Games";
  loadGames(filter);
});

// Load games when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadGames();
});
