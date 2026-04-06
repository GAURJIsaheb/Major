import { config as dotenvConfig } from "dotenv";
import { z as zod } from "zod";

dotenvConfig();

const EnvSchema = zod.object({
  SQS_URL: zod.string().min(1),
  SQS_ENDPOINT: zod.string().min(1),
  AWS_REGION: zod.string().min(1),
  SQS_REGION: zod.string().min(1),
  MONGO_DB_URL: zod.string().min(1),
  DB_NAME: zod.string().min(1),
  S3_ENDPOINT: zod.string().min(1),
  S3_REGION: zod.string().min(1),
  AWS_PROFILE_PHOTO_BUCKET: zod.string().min(1),
  REDIS_URL: zod.string().min(1),
  S3_FORCE_PATH_STYLE: zod
    .preprocess((value) => value === "true", zod.boolean())
    .default(false),
  FACE_VERIFIER_URL: zod.string().min(1),
  FACE_VERIFIER_TIMEOUT_MS: zod
    .preprocess((value) => Number(value), zod.number().min(0))
    .optional(),
});

class Config {
  MustLoad() {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.format());
      process.exit(1);
    }

    return parsed.data;
  }
}

export default Config;
