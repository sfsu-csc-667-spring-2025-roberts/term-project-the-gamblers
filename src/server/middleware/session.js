import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { v4 as uuidv4 } from "uuid"; // We'll need to add this dependency

const setupSession = (app) => {
  // Create a new instance each time to avoid singleton issues
  const pgSession = connectPgSimple(session);

  const sessionMiddleware = session({
    name: `uno_game_sid_${uuidv4().substring(0, 8)}`, // Generate unique name for each server restart
    store: new pgSession({
      conObject: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      },
      tableName: "session", // This is the default table name used by connect-pg-simple
      createTableIfMissing: true, // Let the library create its own table
      pruneSessionInterval: 60, // Clean expired sessions every minute
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: function () {
      return uuidv4(); // Generate a unique session ID for each session
    },
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // Use 'lax' instead of 'strict' to work better with most browsers
    },
  });

  app.use(sessionMiddleware);
  return sessionMiddleware;
};

export default setupSession;
