import express from "express";
import User from "../../db/users/index.js";

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("auth/register", { error: null });
});

router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try{
        const userId = await User.register(username, email, password);
        res.json({ userId });
    } catch (error) {
        res.render("auth/register", { error: "Failed to register" });
    }
});

router.get("/login", (req, res) => {
    res.render("auth/login", { error: null });

});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const userId = await User.login(email, password);
        res.json({ userId });
    } catch (error) {
        console.error("Failed to login:", error);
        res.render("auth/login", { error: "Failed to login" });
    }

});

router.get("/logout", (req, res) => { });


export default router;
