/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("friends", (table) => {
    table.string("id", 36).primary();
    table.string("user_id", 36).notNullable();
    table.string("friend_id", 36).notNullable();
    table.string("status", 50).nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());

    // Add foreign key constraints
    table.foreign("user_id").references("user_id").inTable("users");
    table.foreign("friend_id").references("user_id").inTable("users");

    // Add indexes
    table.index("user_id");
    table.index("friend_id");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("friends");
};
