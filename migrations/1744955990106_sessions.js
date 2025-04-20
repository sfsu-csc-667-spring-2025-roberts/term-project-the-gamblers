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
  pgm.createTable("sessions", {
    session_id: {
      type: "serial",
      primaryKey: true,
    },
    user_id: {
      type: "serial",
      notNull: true,
      references: "users(id)",
    },
    token: {
      type: "text",
      notNull: true,
    },
    expires_at: {
      type: "timestamp",
      notNull: true,
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Create indexes
  pgm.createIndex("sessions", "user_id");
  pgm.createIndex("sessions", "token");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("sessions");
};
