/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("sessions", (table) => {
    table.increments("id").primary();
    table.string("user_id", 36).notNullable();
    table.string("session_token", 255).nullable().unique();
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expires_at").nullable();

    // Add foreign key constraint
    table.foreign("user_id").references("user_id").inTable("users");

    // Add index
    table.index("user_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("sessions");
};
