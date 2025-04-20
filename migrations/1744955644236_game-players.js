/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("game_players", {
    game_player_id: {
      type: "serial",
      primaryKey: true,
    },
    game_id: {
      type: "serial",
      notNull: true,
      references: "games(game_id)",
    },
    user_id: {
      type: "serial",
      notNull: true,
      references: "users(id)",
    },
    joined_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
    turn_order: {
      type: "integer",
      notNull: false,
    },
    is_winner: {
      type: "boolean",
      notNull: true,
      default: false,
    },
  });

  // Create indexes
  pgm.createIndex("game_players", "game_id");
  pgm.createIndex("game_players", "user_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("game_players");
};
