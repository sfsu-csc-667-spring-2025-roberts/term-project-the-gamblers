import db from "../connection.js";

const createGame = async (gameName, maxPlayers, visibility, password, userId) => {

    const game = await db.query(
        "INSERT INTO games (game_name, max_players, visibility, password, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING game_id",
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

const joinGame = async (game_id, user_id, password) => {
    const CONDITIONALLY_JOIN_SQL = `
    INSERT INTO game_players (game_id, user_id)
    SELECT $1, $2
    WHERE NOT EXISTS (
        SELECT 1
        FROM game_players
        WHERE game_id = $1 AND user_id = $2
    )
    AND (
        SELECT COUNT(*) FROM games WHERE game_id = $1 AND password = $3
    ) = 1
    AND (
        (SELECT COUNT(*) FROM game_players WHERE game_id = $1) < (SELECT max_players FROM games WHERE game_id = $1)
    )
    RETURNING (
        SELECT COUNT(*) FROM game_players WHERE game_id = $1
    ) as count
    `;
    const result = await db.query(CONDITIONALLY_JOIN_SQL, [game_id, user_id, password]);
    return result.rows[0] ? result.rows[0].count : null;
};

const getGameById = async (game_id) => {
    const result = await db.query("SELECT * FROM games WHERE game_id = $1", [game_id]);
    return result.rows[0];
};

const removeGame = async (game_id, user_id) => {
    // Remove all players from the game first
    await db.query("DELETE FROM game_players WHERE game_id = $1", [game_id]);
    // Only delete if the user is the owner
    const result = await db.query("DELETE FROM games WHERE game_id = $1 AND owner_id = $2", [game_id, user_id]);
    return result.rowCount > 0; // true if deleted, false otherwise
};

const leaveGame = async (game_id, user_id) => {
    const result = await db.query(
        "DELETE FROM game_players WHERE game_id = $1 AND user_id = $2", 
        [game_id, user_id]
    );
    return result.rowCount > 0; // true if a player was removed, false otherwise
};

export default { createGame, getGames, joinGame, getGameById, removeGame, leaveGame };
