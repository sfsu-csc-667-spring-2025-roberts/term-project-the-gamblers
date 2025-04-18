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

        req.session.userId = userId; // Store user ID in session
        res.redirect("/lobby"); // Redirect to lobby page after successful registration

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
        req.session.userId = userId; // Store user ID in session
        res.redirect("/lobby"); // Redirect to lobby page after successful log in
    } catch (error) {
        console.error("Failed to login:", error);
        res.render("/auth/login", { error: "Failed to login" });
    }

});

router.get("/logout", (req, res) => { 
    req.session.destroy((err) => {
        if (err) {
            console.error("Failed to destroy session:", err);
            return res.status(500).send("Failed to log out");
        }
        res.redirect("/"); // Redirect to login page after successful log out
    });
});


export default router;
