/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("chat_messages", (table) => {
    table.string("message_id", 36).primary();
    table.string("sender_id", 36).notNullable();
    table.string("receiver_id", 36).notNullable();
    table.string("game_id", 36).nullable();
    table.text("message").notNullable();
    table.timestamp("sent_at").defaultTo(knex.fn.now());

    // Add foreign key constraints
    table.foreign("sender_id").references("user_id").inTable("users");
    table.foreign("receiver_id").references("user_id").inTable("users");
    table.foreign("game_id").references("game_id").inTable("games");

    // Add indexes
    table.index("sender_id");
    table.index("receiver_id");
    table.index("game_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("chat_messages");
};
