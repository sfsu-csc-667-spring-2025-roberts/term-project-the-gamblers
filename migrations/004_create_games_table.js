/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("games", (table) => {
    table.string("game_id", 36).primary();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("started_at").nullable();
    table.timestamp("ended_at").nullable();
    table.string("status", 50).nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("games");
};
