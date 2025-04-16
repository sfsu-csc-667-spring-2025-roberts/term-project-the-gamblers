/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("game_deck", (table) => {
    table.string("deck_id", 36).primary();
    table.string("game_id", 36).notNullable();
    table.integer("card_id").unsigned().notNullable();
    table.string("location", 50).nullable();
    table.integer("order_position").nullable();
    table.timestamp("placed_at").defaultTo(knex.fn.now());

    // Add foreign key constraints
    table.foreign("game_id").references("game_id").inTable("games");
    table.foreign("card_id").references("card_id").inTable("cards");

    // Add indexes
    table.index("game_id");
    table.index("card_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("game_deck");
};
