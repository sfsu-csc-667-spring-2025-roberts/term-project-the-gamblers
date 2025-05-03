const createGameButton = document.querySelector("#create-game-btn");
const createGameForm = document.querySelector("#create-game-form-container");
const cancelCreateGameButton = document.querySelector("#cancel-create-game");

createGameButton?.addEventListener("click", (event) => {
  event.preventDefault();
  console.log("create game button clicked");

  createGameForm?.classList.add("visible");
});

cancelCreateGameButton?.addEventListener("click", (event) => {
  event.preventDefault();

  createGameForm?.classList.remove("visible");
});
