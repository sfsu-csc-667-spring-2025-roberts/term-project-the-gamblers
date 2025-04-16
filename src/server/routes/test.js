import express from "express";
import db from "../../db/connection.js";

const router = express.Router();

// router.get("/", async (_req, res) => {
//     try {
//         const [rows] = await db.promise().query("SELECT * FROM cards");
//         res.json(rows);
//     } catch (error) {
//         console.error("Database query error:", error);
//         res.status(500).json({ error: "Database query failed" });
//     }
// });

router.get("/", async (_req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const [result] = await db
      .promise()
      .query("INSERT INTO test_table (name) VALUES (?)", [timestamp]);
    res.json(await db.promise().query("SELECT * FROM test_table"));
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: "Insert failed" });
  }
});

export default router;
