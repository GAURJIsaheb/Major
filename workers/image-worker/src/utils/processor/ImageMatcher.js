import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import SysConf from "../../conf/config.js";
import { verifyFaceUsingService } from "../services/FaceVerifier.js";

const Config = new SysConf().MustLoad();
const s3Client = new S3Client({
  region: Config.S3_REGION,
  endpoint: Config.S3_ENDPOINT || undefined,
  forcePathStyle: Config.S3_FORCE_PATH_STYLE,
});

function normalizeContentType(value) {
  if (!value) return "image/jpeg";
  return value.split(";")[0].trim().toLowerCase();
}

async function downloadBuffer(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error(`Empty body for s3://${bucket}/${key}`);
  }

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return {
    buffer: Buffer.concat(chunks),
    contentType: normalizeContentType(response.ContentType),
  };
}

async function MatchFaces(employeeId, punchLocation) {
  if (!employeeId) {
    return {
      match: false,
      similarity: null,
      error: "Missing employee ID for verification",
    };
  }

  if (!punchLocation?.bucket || !punchLocation?.key) {
    return {
      match: false,
      similarity: null,
      error: "Invalid punch photo location",
    };
  }

  try {
    const { buffer, contentType } = await downloadBuffer(
      punchLocation.bucket,
      punchLocation.key,
    );

    const verification = await verifyFaceUsingService(
      employeeId,
      buffer,
      contentType,
    );

    const similarity =
      typeof verification?.confidence === "number"
        ? Number(verification.confidence.toFixed(4))
        : null;

    return {
      match: Boolean(verification?.match),
      similarity,
      threshold: verification?.threshold ?? null,
    };
  } catch (error) {
    const detail =
      error?.name && error?.message
        ? `${error.name}: ${error.message}`
        : error?.message || "Unknown verification error";
    console.error("Face verification failed:", detail);
    return {
      match: false,
      similarity: null,
      error: detail,
    };
  }
}

export default MatchFaces;
