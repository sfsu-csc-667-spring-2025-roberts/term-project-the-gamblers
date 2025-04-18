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
  pgm.createTable("cards", {
    card_id: {
      type: "serial",
      primaryKey: true,
    },
    color: {
      type: "varchar(50)",
      notNull: false,
    },
    value: {
      type: "varchar(50)",
      notNull: true,
    },
    type: {
      type: "varchar(50)",
      notNull: false,
    },
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
      pgm.sql(`
                INSERT INTO cards (color, value, type)
                VALUES ('${color}', '${number}', 'number')
            `);
    }
  }

  // Insert action cards for each color (2 of each)
  for (const color of colors) {
    for (const action of actionCards) {
      pgm.sql(`
                INSERT INTO cards (color, value, type)
                VALUES ('${color}', '${action}', 'action'),
                       ('${color}', '${action}', 'action')
            `);
    }
  }

  // Insert wild cards (4 of each)
  for (const wild of wildCards) {
    pgm.sql(`
            INSERT INTO cards (color, value, type)
            VALUES (NULL, '${wild}', 'wild'),
                   (NULL, '${wild}', 'wild'),
                   (NULL, '${wild}', 'wild'),
                   (NULL, '${wild}', 'wild')
        `);
  }
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("cards");
};
