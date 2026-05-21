import express from "express";
import http from "http";
import cors from "cors";
import DB from "./config/Db.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";
import Routes from "./routes.js";
import RedisClient from "./config/Redis.js";
import { initChatWebSocket } from "./config/ChatWS.js";

const parseCorsOrigins = (value) => {
  if (!value) return ["http://localhost:5173"];
  const origins = value
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return origins.length > 0 ? origins : ["http://localhost:5173"];
};

class App {
  constructor(DbUrl, DbName, RedisUrl) {
    this.app = express();
    if (process.env.NODE_ENV === "production") {
      // Needed for correct cookie / HTTPS behavior behind Render's proxy.
      this.app.set("trust proxy", 1);
    }
    this.server = http.createServer(this.app);
    this.#initializeSerivces(DbUrl, DbName, RedisUrl);
    this.#initializeMiddlewares();
    this.#initializeRoutes();
    this.#initializeErrorHandling();
    this.#initializeWebSockets();
    this.Db = null;
  }

  async #initializeSerivces(url, name, redisUrl) {
    this.Db = await new DB(url, name).Connect();
    this.redis = new RedisClient(redisUrl).GetClient();
  }

  #initializeRoutes() {
    this.app.use("/api/v1", new Routes().routes());
  }

  #initializeWebSockets() {
    initChatWebSocket(this.server);
  }

  #initializeMiddlewares() {
    const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGIN);
    this.app.use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      })
    );
    // Kanban tasks can include base64 image data URLs; bump payload limits accordingly.
    this.app.use(express.json({ limit: "6mb" }));
    this.app.use(cookieParser());
    this.app.use(express.urlencoded({ extended: false, limit: "6mb" }));
  }

  Listen(PORT) {
    this.server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }

  #initializeErrorHandling() {
    this.app.use(errorHandler);
  }
}

export default App;
