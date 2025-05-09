import db from "../connection.js";

const createGame = async (gameName, maxPlayers, visibility, password, userId) => {

    const game = await db.query("INSERT INTO games (game_name, max_players, visibility, password, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING game_id",
        [gameName, maxPlayers, visibility, password, userId]);

    const gameId = game.rows[0].game_id;

    await db.query("INSERT INTO game_players (game_id, user_id) VALUES ($1, $2)",
        [gameId, userId]);

    return gameId;
};

const getGames = async (user_id) => {
    const games = await db.query("SELECT * FROM games WHERE owner_id != $1", [user_id]);
    console.log("games", games.rows);

    return games.rows;
};

export default { createGame, getGames };
