import express from "express";
import User from "../../db/users/index.js";
import db from "../../db/connection.js";

const router = express.Router();

router.get("/register", (req, res) => {
  res.render("auth/register", {});
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
  res.render("auth/login", {});
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // First, check if there's an existing session for this request
    if (req.session.userId) {
      console.log(
        `Clearing existing session for user ${req.session.userId} before new login`,
      );
      await new Promise((resolve) => {
        req.session.destroy((err) => {
          if (err) console.error("Error clearing existing session:", err);
          resolve();
        });
      });
    }

    // Create a new session for the login
    const user = await User.login(email, password);

    // Clear any existing sessions for this user in the database
    try {
      await db.query(
        `
        DELETE FROM session 
        WHERE sess::jsonb @> '{"userId": ${user.id}}'::jsonb 
        AND sid != $1
      `,
        [req.sessionID],
      );
    } catch (err) {
      console.error("Error cleaning up old sessions:", err);
      // Continue with login even if cleanup fails
    }

    // Set up the new session
    req.session.userId = user.id;
    req.session.username = user.username;

    // Force save the session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
      res.redirect("/lobby");
    });
  } catch (error) {
    console.error("Failed to login:", error);
    res.render("auth/login", { error: "Invalid email or password" });
  }
});

router.get("/logout", async (req, res) => {
  const userId = req.session.userId;
  const username = req.session.username;

  try {
    // Log the logout action
    console.log(`User logout: ${username} (ID: ${userId})`);

    // Clean up any socket connections for this user (if applicable)
    if (global.io) {
      const connectedSockets = Array.from(global.io.sockets.sockets.values());
      for (const socket of connectedSockets) {
        if (
          socket.request.session &&
          socket.request.session.userId === userId
        ) {
          console.log(`Closing socket connection for user ${userId}`);
          socket.disconnect(true);
        }
      }
    }

    // Clean up any game-specific resources
    // This could be expanded based on your application's needs

    // Remove all sessions for this user from the database
    if (userId) {
      try {
        const result = await db.query(`
          DELETE FROM session 
          WHERE sess::jsonb @> '{"userId": ${userId}}'::jsonb
        `);
        console.log(
          `Cleaned up ${result.rowCount} sessions for user ${userId}`,
        );
      } catch (err) {
        console.error("Error cleaning up sessions during logout:", err);
      }
    }

    // Finally destroy the current session
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).send("Failed to log out");
      }

      // Clear the session cookie on the client
      res.clearCookie("connect.sid");

      res.redirect("/");
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("An error occurred during logout");
  }
});

// Add utility endpoints for session management

// Clean all sessions - development only
router.get("/clean-sessions", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).send("Not available in production");
  }

  try {
    const result = await db.query("DELETE FROM session");
    res.send(`Cleaned ${result.rowCount} sessions from database`);
  } catch (err) {
    console.error("Error cleaning sessions:", err);
    res.status(500).send("Error cleaning sessions");
  }
});

// View active sessions - development only
router.get("/view-sessions", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).send("Not available in production");
  }

  try {
    const sessions = await db.query(
      "SELECT sid, sess->'userId' as user_id, sess->'username' as username, expire FROM session",
    );
    res.json(sessions.rows);
  } catch (err) {
    console.error("Error viewing sessions:", err);
    res.status(500).send("Error viewing sessions");
  }
});

// Clean expired sessions - can be used in production
router.get("/clean-expired", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM session WHERE expire < NOW()");
    res.send(`Cleaned ${result.rowCount} expired sessions from database`);
  } catch (err) {
    console.error("Error cleaning expired sessions:", err);
    res.status(500).send("Error cleaning expired sessions");
  }
});

export default router;
