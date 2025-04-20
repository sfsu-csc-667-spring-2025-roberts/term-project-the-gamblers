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
  pgm.createTable("friends", {
    id: {
      type: "serial",
      primaryKey: true,
    },
    user_id: {
      type: "serial",
      notNull: true,
      references: "users(id)",
    },
    friend_id: {
      type: "serial",
      notNull: true,
      references: "users(id)",
    },
    status: {
      type: "varchar(50)",
      notNull: false,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Create indexes
  pgm.createIndex("friends", "user_id");
  pgm.createIndex("friends", "friend_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("friends");
};
