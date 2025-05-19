import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  const title = "How to Play UNO";
  const name = "UNO, presented by The Gamblers";

  res.render("howtoplay", { title, name });
});

export default router;
