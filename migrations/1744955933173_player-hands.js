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
  pgm.createTable("player_hands", {
    hand_id: {
      type: "char(36)",
      primaryKey: true,
    },
    game_player_id: {
      type: "char(36)",
      notNull: true,
      references: "game_players(game_player_id)",
    },
    card_id: {
      type: "integer",
      notNull: true,
      references: "cards(card_id)",
    },
    drawn_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
    played_at: {
      type: "timestamp",
      notNull: false,
    },
  });

  // Create indexes
  pgm.createIndex("player_hands", "game_player_id");
  pgm.createIndex("player_hands", "card_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("player_hands");
};
