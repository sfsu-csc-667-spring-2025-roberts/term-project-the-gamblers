import db from "../connection.js";

const createGame = async (gameName, maxPlayers, visibility, password, userId) => {

    const game = await db.query("INSERT INTO games (game_name, max_players, visibility, password) VALUES ($1, $2, $3, $4) RETURNING game_id",
        [gameName, maxPlayers, visibility, password]);

    const gameId = game.rows[0].game_id;

    await db.query("INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
        [gameId, userId]);

    return gameId;
};

const getGames = async () => {
    const games = await db.query("SELECT * FROM games WHERE visibility = 'public'");
    return games.rows;
};

export default { createGame, getGames };
