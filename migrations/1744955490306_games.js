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
  pgm.createTable("games", {
    game_id: {
      type: "serial",
      primaryKey: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    game_name: {
      type: "varchar(50)",
      notNull: true,
    },
    max_players: {
      type: "integer",
      notNull: true,
    },
    visibility: {
      type: "varchar(50)",
      notNull: true,
    },
    password: {
      type: "varchar(50)",
      notNull: false,
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("games");
};
