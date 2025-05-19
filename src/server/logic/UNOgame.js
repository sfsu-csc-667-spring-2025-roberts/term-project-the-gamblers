import db from "../../db/connection.js";
import { shuffle } from "./utility.js";

export class UNOGame {
  constructor(gameId, players) {
    this.gameId = gameId;
    this.players = players.map((p) => ({
      id: p.id,
      name: p.username,
      hand: [],
      hasSaidUNO: false,
    })); // Player objects
    this.currentPlayerIndex = 0; // Index of the current player
    this.direction = 1; // 1 for clockwise, -1 for counter-clockwise
    this.drawPile = [];
    this.discardPile = [];
    this.currentColor = null; // Current color in play
    this.currentValue = null; // Current value in play
    this.isStarted = false; // Game started flag
    this.winner = null; // Winner of the game
  }

  async initialize() {
    const deck = await getDeckFromDatabase();
    this.drawPile = shuffle(deck);
    this.discardPile = [];

    dealInitialCards(this.players, this.drawPile);

    const firstCard = drawValidStartingCard(this.drawPile);
    this.discardPile.push(firstCard);
    this.currentColor = firstCard.color;
    this.currentValue = firstCard.value;
    this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
    this.isStarted = true;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getGameState() {
    const currentPlayer = this.getCurrentPlayer();
    console.log("Getting game state:", {
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: currentPlayer?.id,
      players: this.players.map((p) => ({ id: p.id, name: p.name })),
    });

    return {
      gameId: this.gameId,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        handSize: p.hand.length,
        hasSaidUNO: p.hasSaidUNO,
      })),
      currentPlayerId: currentPlayer?.id,
      topCard: this.discardPile[this.discardPile.length - 1],
      currentColor: this.currentColor,
      direction: this.direction,
      isStarted: this.isStarted,
      winner: this.winner,
    };
  }

  getPlayerState(playerId) {
    console.log("Getting player state for:", {
      playerId,
      currentPlayerId: this.getCurrentPlayer()?.id,
      allPlayerIds: this.players.map((p) => p.id),
    });

    const player = this.players.find((p) => String(p.id) === String(playerId));
    if (!player) {
      console.log("Player not found:", playerId);
      return null;
    }

    const currentPlayer = this.getCurrentPlayer();
    const isYourTurn =
      currentPlayer && String(currentPlayer.id) === String(playerId);

    console.log("Player state result:", {
      playerId,
      isYourTurn,
      currentPlayerId: currentPlayer?.id,
    });

    return {
      hand: player.hand,
      yourTurn: isYourTurn,
      topCard: this.discardPile[this.discardPile.length - 1],
      currentColor: this.currentColor,
      drawPileCount: this.drawPile.length,
      discardPile: this.discardPile,
    };
  }
}

async function getDeckFromDatabase() {
  const result = await db.query("SELECT * FROM cards");
  // console.log(result.rows);
  // console.dir(result, { depth: null });
  return result.rows;
}

function dealInitialCards(players, drawPile, cardsPerPlayer = 7) {
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (const player of players) {
      const card = drawPile.pop();
      player.hand.push(card);
    }
  }
}

function drawValidStartingCard(drawPile) {
  let card;
  do {
    card = drawPile.pop();
    const isNumberCard = !isNaN(Number(card.value));
    if (isNumberCard) {
      break;
    }
    drawPile.unshift(card); // If invalid, put it back to the bottom of the draw pile
  } while (true);
  return card;
}

function isPlayable(card, currentColor, currentValue) {
  if (card.type === "wild") return true;
  return (
    card.color === currentColor ||
    (card.value === currentValue && card.type !== "wild")
  );
}

export function drawCard(game, playerId) {
  const player = game.players.find((p) => p.id === playerId);
  if (!player || game.getCurrentPlayer().id !== playerId) {
    return null; // Not the player's turn
  }

  const card = game.drawPile.pop();
  player.hand.push(card);
  if (game.drawPile.length === 0) {
    const topCard = game.discardPile.pop();
    game.drawPile = shuffle(game.discardPile);
    game.discardPile = [topCard];
  }

  moveToNextPlayer(game);
  return null;
}

export function playCard(game, playerId, card) {
  const player = game.getCurrentPlayer();
  if (!player || player.id !== playerId) {
    console.log("Not the player's turn");
    return null;
  }
  const cardIndex = player.hand.findIndex((c) => c.card_id === card.card_id);
  if (cardIndex === -1) {
    console.log("Card not found in player's hand");
    return null;
  }
  if (!isPlayable(card, game.currentColor, game.currentValue)) {
    console.log("Card not playable");
    return null;
  }
  const [playedCard] = player.hand.splice(cardIndex, 1);
  game.discardPile.push(playedCard);
  game.currentValue = playedCard.value;
  game.currentColor =
    playedCard.type === "wild" ? game.currentColor : playedCard.color;
  applyCardEffect(game, playedCard);
  if (player.hand.length === 0) {
    game.winner = player;
    game.isStarted = false;
  } else {
    moveToNextPlayer(game);
  }
  return { success: true };
}

function moveToNextPlayer(game) {
  game.currentPlayerIndex =
    (game.currentPlayerIndex + game.direction + game.players.length) %
    game.players.length;
}

export function addPlayer(game, player) {
  if (!game || !Array.isArray(game.players)) {
    console.error("Invalid game object passed to addPlayer");
    return;
  }
  if (!player || !player.id) {
    console.error("Invalid player object passed to addPlayer");
    return;
  }
  // Check if player already exists
  if (game.players.some((p) => p && p.id === player.id)) {
    // Player already exists, do not add or deal new cards
    return;
  }
  // Add player with empty hand
  game.players.push({
    id: player.id,
    name: player.username,
    hand: [],
    hasSaidUNO: false,
  });
  // Deal initial cards
  for (let i = 0; i < 7; i++) {
    const card = game.drawPile.pop();
    game.players[game.players.length - 1].hand.push(card);
  }
}

function applyCardEffect(game, card) {
  switch (card.value) {
    case "skip":
      moveToNextPlayer(game);
      break;
    case "reverse":
      game.direction *= -1;
      break;
    case "draw2":
      giveCardsToNextPlayer(game, 2);
      moveToNextPlayer(game);
      break;
    case "wild_draw4":
      giveCardsToNextPlayer(game, 4);
      moveToNextPlayer(game);
      break;
    case "wild":
      // Wild card, color should be set by the client; nothing to do here
      break;
    default:
      break; // No effect for regular cards
  }
}

function giveCardsToNextPlayer(game, count) {
  moveToNextPlayer(game);
  const nextPlayer = game.getCurrentPlayer();
  for (let i = 0; i < count; i++) {
    nextPlayer.hand.push(game.drawPile.pop());
  }
}

export function callUNO(gameId, player) {
  const game = activeGames.get(gameId);
  if (!game) return; // Game not found
  const playerInGame = game.players.find((p) => p.id === player.id);
  if (playerInGame) {
    playerInGame.hasSaidUNO = true;
  }
  if (game.players.every((p) => p.hasSaidUNO)) {
    game.players.forEach((p) => (p.hasSaidUNO = false)); // Reset UNO status for all players
  }
}

export function checkUNO(game, player) {
  if (player.hand.length === 1 && !player.hasSaidUNO) {
    giveCardsToNextPlayer(game, 2);
    player.hasSaidUNO = true;
    return true; // Player has not called UNO
  }
  return false; // Player has called UNO
}
