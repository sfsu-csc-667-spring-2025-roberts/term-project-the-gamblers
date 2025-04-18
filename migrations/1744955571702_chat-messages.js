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
  pgm.createTable("chat_messages", {
    message_id: {
      type: "char(36)",
      primaryKey: true,
    },
    sender_id: {
      type: "char(36)",
      notNull: true,
      references: "users(user_id)",
    },
    receiver_id: {
      type: "char(36)",
      notNull: true,
      references: "users(user_id)",
    },
    game_id: {
      type: "char(36)",
      notNull: false,
      references: "games(game_id)",
    },
    message: {
      type: "text",
      notNull: true,
    },
    sent_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Create indexes
  pgm.createIndex("chat_messages", "sender_id");
  pgm.createIndex("chat_messages", "receiver_id");
  pgm.createIndex("chat_messages", "game_id");
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("chat_messages");
};
