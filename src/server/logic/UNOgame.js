import db from '../../db/connection.js';
import { shuffle } from './utility.js';

export class UNOGame {
    constructor(gameId, players) {
        this.gameId = gameId;
        this.players = players.map(p => ({
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
        return {
            gameId: this.gameId,
            players: this.players.map(p => ({
                id: p.id,
                name: p.name,
                handSize: p.hand.length,
                hasSaidUNO: p.hasSaidUNO
            })),
            currentPlayerId: this.getCurrentPlayer().id,
            topCard: this.discardPile[this.discardPile.length - 1],
            currentColor: this.currentColor,
            direction: this.direction,
            isStarted: this.isStarted,
            winner: this.winner
        };
    }

    getPlayerState(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return null;

        return {
            hand: player.hand,
            yourTurn: this.getCurrentPlayer().id === playerId,
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
    return (card.color === currentColor ||
        card.value === currentValue ||
        card.color === "black");
}

export function drawCard(game, playerId) {
    const player = game.players.find(p => p.id === playerId);
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
    // console.log("playerId", playerId, "card", card);
    const player = game.getCurrentPlayer();
    if (!player || player.id !== playerId) {
        console.log("Not the player's turn");
        return null; // Not the player's turn
    }

    // console.log("player", player);


    const cardIndex = player.hand.findIndex(c => c.card_id === card.card_id);
    console.log("cardIndex", cardIndex);
    if (cardIndex === -1) {
        console.log("Card not found in player's hand");
        return null; // Card not found in player's hand
    }
    if (!isPlayable(card, game.currentColor, game.currentValue)) {
        console.log("Card not playable");
        return null; // Card not playable
    }

    const [playedCard] = player.hand.splice(cardIndex, 1);
    // console.log("playedCard", playedCard);
    game.discardPile.push(playedCard);
    game.currentValue = playedCard.value;
    game.currentColor = (playedCard.type === "wild") ? game.currentColor : playedCard.color;

    applyCardEffect(game, playedCard);

    if (player.hand.length === 0) {
        game.winner = player;
        game.isStarted = false; // End the game
    } else {
        moveToNextPlayer(game);
    }

    return { success: true };
}

function moveToNextPlayer(game) {
    game.currentPlayerIndex = (game.currentPlayerIndex + game.direction + game.players.length) % game.players.length;
}

function applyCardEffect(game, card) {
    switch (card.value) {
        case "skip":
            moveToNextPlayer(game);
            break;
        case "reverse":
            game.direction *= -1;
            break;
        case "drawTwo":
            giveCardsToNextPlayer(game, 2);
            moveToNextPlayer(game);
            break;
        case "wildDrawFour":
            giveCardsToNextPlayer(game, 4);
            moveToNextPlayer(game);
            break;
        case "wild":
            // Wild card, player chooses color
            const chosenColor = prompt("Choose a color: red, green, blue, yellow");
            if (["red", "green", "blue", "yellow"].includes(chosenColor)) {
                game.currentColor = chosenColor;
            }
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
    const playerInGame = game.players.find(p => p.id === player.id);
    if (playerInGame) {
        playerInGame.hasSaidUNO = true;
    }
    if (game.players.every(p => p.hasSaidUNO)) {
        game.players.forEach(p => p.hasSaidUNO = false); // Reset UNO status for all players
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

export default {
    UNOGame,
    drawCard,
    playCard,
    callUNO,
    checkUNO
}