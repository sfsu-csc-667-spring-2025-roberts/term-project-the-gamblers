/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.createTable("cards", (table) => {
    table.increments("card_id").primary();
    table.string("color", 50).nullable();
    table.string("value", 50).notNullable();
    table.string("type", 50).nullable();
  });

  // Insert all UNO cards
  const colors = ["red", "blue", "green", "yellow"];
  const numbers = [
    "0",
    "1",
    "1",
    "2",
    "2",
    "3",
    "3",
    "4",
    "4",
    "5",
    "5",
    "6",
    "6",
    "7",
    "7",
    "8",
    "8",
    "9",
    "9",
  ];
  const actionCards = ["skip", "reverse", "draw2"];
  const wildCards = ["wild", "wild_draw4"];

  // Insert number cards for each color
  for (const color of colors) {
    for (const number of numbers) {
      await knex("cards").insert({
        color: color,
        value: number,
        type: "number",
      });
    }
  }

  // Insert action cards for each color (2 of each)
  for (const color of colors) {
    for (const action of actionCards) {
      await knex("cards").insert([
        { color: color, value: action, type: "action" },
        { color: color, value: action, type: "action" },
      ]);
    }
  }

  // Insert wild cards (4 of each)
  for (const wild of wildCards) {
    await knex("cards").insert([
      { color: null, value: wild, type: "wild" },
      { color: null, value: wild, type: "wild" },
      { color: null, value: wild, type: "wild" },
      { color: null, value: wild, type: "wild" },
    ]);
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.dropTable("cards");
};
