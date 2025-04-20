import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  // userId is available in res.locals thanks to the auth middleware
  res.render("lobby", {
    userId: res.locals.userId,
    username: req.session.username || 'Player'
  });
});

export default router;
