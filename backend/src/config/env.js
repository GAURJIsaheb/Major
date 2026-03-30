import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Config from "./Config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceEnvFiles = {
  backend: "nexushr-backend.env",
  "analytics-worker": "nexushr-analytics-worker.env",
  "image-worker": "nexushr-image-worker.env",
  "mails-worker": "nexushr-mails-worker.env",
  "payroll-batch": "nexushr-payroll-batch.env",
  "payroll-generator": "nexushr-payroll-generator.env",
};
const serviceName = process.env.SERVICE_NAME ?? "backend";
const resolvedEnvFile =
  process.env.DOTENV_CONFIG_PATH ??
  path.join(__dirname, "..", "..", "env", serviceEnvFiles[serviceName] ?? serviceEnvFiles.backend);

const result = dotenv.config({ path: resolvedEnvFile, override: true });
if (result.error && result.error.code !== "ENOENT") {
  throw result.error;
}

const envDebug = {
  serviceName,
  envFile: resolvedEnvFile,
  awsRegion: process.env.AWS_REGION,
  hasAwsCredentials: Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
  s3Bucket: process.env.S3_BUCKET,
};
console.debug("dotenv loaded", envDebug);

try {
  const redisUrl = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;
  if (redisUrl) {
    process.env.REDIS_HOST = process.env.REDIS_HOST ?? redisUrl.hostname;
    process.env.REDIS_PORT =
      process.env.REDIS_PORT ??
      (redisUrl.port || (redisUrl.protocol === "rediss:" ? "6379" : "6379"));
  }
} catch {
  //
}

export const Cfg = new Config().MustLoad();
