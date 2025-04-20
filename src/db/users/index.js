import db from '../connection.js'
import bcrypt from 'bcryptjs';

const register = async (username, email, password) => {
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(db);

    try {
        const result = await db.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username",
            [username, email, encryptedPassword]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error registering user:", error);
        throw new Error("User registration failed");
    }
};

const login = async (email, password) => {
    const result = await db.query("SELECT id, username, password FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }

    const user = result.rows[0];

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
        throw new Error("Failed to Login");
    }

    return {
        id: user.id,
        username: user.username
    };
};

export default { register, login };