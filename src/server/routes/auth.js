import express from "express";
import User from "../../db/users/index.js";

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth/register", { error: null });
});

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.register(username, email, password);
    //req.session.userId = user.id;
    //req.session.username = user.username;
    res.redirect("/lobby");
  } catch (error) {
    console.error("Failed to register:", error);
    res.render("auth/register", { error: "Failed to register" });
  }
});

router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    req.session.userId = user.id;
    req.session.username = user.username;

    res.redirect("/lobby");
  } catch (error) {
    console.error("Failed to login:", error);
    res.render("auth/login", { error: "Invalid email or password" });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Failed to destroy session:", err);
      return res.status(500).send("Failed to log out");
    }
    res.redirect("/");
  });
});

export default router;
