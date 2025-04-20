import db from "../connection.js";
import bcrypt from "bcryptjs";

const register = async (username, email, password) => {
  const encryptedPassword = await bcrypt.hash(password, 10);
  console.log(db);

  try {
    const result = await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id",
      [username, email, encryptedPassword],
    );
    const { user_id } = result.rows[0];
    return user_id;
  } catch (error) {
    console.error("Error registering user:", error);
    throw new Error("User registration failed");
  }
};

const login = async (email, password) => {
  const result = await db.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  const user = result.rows[0];

  if (!user) {
    throw new Error("User not found");
  }

  const passwordsMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordsMatch) {
    throw new Error("Failed to Login");
  }

  return user; // return the full user object
};

export default { register, login };
