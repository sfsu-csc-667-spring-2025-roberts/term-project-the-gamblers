import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  const title = "UNO Application";
  const name = "UNO, presented by The Gamblers";

  res.render("root", { title, name });
});

export default router;
