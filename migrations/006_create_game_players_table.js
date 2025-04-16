/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("game_players", (table) => {
    table.string("game_player_id", 36).primary();
    table.string("game_id", 36).notNullable();
    table.string("user_id", 36).notNullable();
    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table.integer("turn_order").nullable();
    table.boolean("is_winner").defaultTo(false);

    // Add foreign key constraints
    table.foreign("game_id").references("game_id").inTable("games");
    table.foreign("user_id").references("user_id").inTable("users");

    // Add indexes
    table.index("game_id");
    table.index("user_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("game_players");
};
