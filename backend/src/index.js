import App from "./server.js";
import { Cfg } from "./config/env.js";

console.debug("service startup", {
  serviceName: process.env.SERVICE_NAME ?? "backend",
  envFile: process.env.DOTENV_CONFIG_PATH,
  awsRegion: process.env.AWS_REGION,
});

const Server = new App(Cfg.MONGO_DB_URL, Cfg.DB_NAME, Cfg.REDIS_URL);

Server.Listen(Cfg.PORT);


