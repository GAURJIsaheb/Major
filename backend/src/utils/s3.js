import "../config/env.js";
import { S3Client } from "@aws-sdk/client-s3";

const requiredKeys = ["AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];
const missingKeys = requiredKeys.filter((key) => !process.env[key]);

if (missingKeys.length) {
  throw new Error(`Missing AWS environment variables: ${missingKeys.join(", ")}`);
}

const awsRegion = process.env.AWS_REGION;
const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const useLocalstack = process.env.S3_USE_LOCALSTACK === "true";
const useCustomEndpoint = process.env.S3_USE_CUSTOM_ENDPOINT === "true";
const configuredEndpoint = process.env.S3_ENDPOINT;
const endpoint =
  useLocalstack && !configuredEndpoint
    ? "http://localhost:4566"
    : useCustomEndpoint && configuredEndpoint
    ? configuredEndpoint
    : configuredEndpoint;
const forcePathStyle = useLocalstack || process.env.S3_FORCE_PATH_STYLE === "true";

export const s3 = new S3Client({
  region: awsRegion,
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
  ...(endpoint ? { endpoint } : {}),
  forcePathStyle,
});
