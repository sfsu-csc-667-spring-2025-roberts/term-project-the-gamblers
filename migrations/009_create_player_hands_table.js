/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("player_hands", (table) => {
    table.string("hand_id", 36).primary();
    table.string("game_player_id", 36).notNullable();
    table.integer("card_id").unsigned().notNullable();
    table.timestamp("drawn_at").defaultTo(knex.fn.now());
    table.timestamp("played_at").nullable();

    // Add foreign key constraints
    table
      .foreign("game_player_id")
      .references("game_player_id")
      .inTable("game_players");
    table.foreign("card_id").references("card_id").inTable("cards");

    // Add indexes
    table.index("game_player_id");
    table.index("card_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("player_hands");
};
