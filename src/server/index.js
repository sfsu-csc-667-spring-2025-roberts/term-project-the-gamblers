import express from "express";
import httpErrors from "http-errors";
import { Server } from "socket.io";
import { createServer } from "http";
import timeMiddleware from "./middleware/time.js";
import * as path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import dotenv from "dotenv";
import favicon from "serve-favicon";
import { fileURLToPath } from "url";
import { dirname } from "path";
import setupSession from "./middleware/session.js";
import initSocketIO from "../../public/js/socket.js";
import games from "./routes/games.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { root, test, auth, lobby, chat, howtoplay } from "./routes/index.js";
import sessionAuthMiddleware from "./middle/auth.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== "production") {
  const liveReloadServer = livereload.createServer();

  liveReloadServer.watch(path.join(__dirname, "../public"));

  liveReloadServer.watch(path.join(process.cwd(), "public", "js"));
  liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
      liveReloadServer.refresh("/");
    }, 100);
  });

  app.use(connectLivereload());
}

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(favicon(path.join(process.cwd(), "public", "favicon.ico")));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "favicon.ico"));
});

app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

// Initialize session middleware
const sessionMiddleware = setupSession(app);
const PORT = process.env.PORT || 3000;

app.use("/", root);
app.use("/test", test);
app.use("/auth", auth);
app.use("/lobby", sessionAuthMiddleware, lobby);
app.use("/games", games);
app.use("/howtoplay", howtoplay);

const httpServer = createServer(app);
const io = new Server(httpServer);

// Pass the session middleware to socket initialization
initSocketIO(io, sessionMiddleware);

app.use("/chat", chat(io));

app.use((_, _res, next) => {
  next(httpErrors(404));
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
