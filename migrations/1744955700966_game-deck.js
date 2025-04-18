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
  pgm.createTable("game_deck", {
    deck_id: {
      type: "char(36)",
      primaryKey: true,
    },
    game_id: {
      type: "char(36)",
      notNull: true,
      references: "games(game_id)",
    },
    card_id: {
      type: "integer",
      notNull: true,
      references: "cards(card_id)",
    },
    location: {
      type: "varchar(50)",
      notNull: false,
    },
    order_position: {
      type: "integer",
      notNull: false,
    },
    placed_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Create indexes
  pgm.createIndex("game_deck", "game_id");
  pgm.createIndex("game_deck", "card_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("game_deck");
};
