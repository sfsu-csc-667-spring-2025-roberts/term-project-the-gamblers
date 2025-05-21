import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
  const title = "Frequently Asked Questions - UNO Online";
  const name = "UNO, presented by The Gamblers";

  res.render("faq", { title, name });
});

export default router;
