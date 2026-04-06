import path from "path";
import axios from "axios";
import FormData from "form-data";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

const FACE_VERIFIER_URL = process.env.FACE_VERIFIER_URL || "http://localhost:8001";
const FACE_VERIFIER_TIMEOUT_MS = Number(process.env.FACE_VERIFIER_TIMEOUT_MS) || 15_000;
const DEFAULT_CONTENT_TYPE = "image/jpeg";

function deriveFileNameFromUrl(imageUrl) {
  try {
    const parsed = new URL(imageUrl);
    const segments = parsed.pathname.split("/").filter(Boolean);
    return segments.pop() || `${Date.now()}.jpg`;
  } catch (error) {
    return `${Date.now()}.jpg`;
  }
}

function parseS3Url(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    let key = parsed.pathname.replace(/^\/+/, "");
    const hostParts = parsed.hostname.split(".");
    let bucket;

    if (hostParts.length >= 3 && hostParts[1] === "s3") {
      bucket = hostParts[0];
    } else if (hostParts[0].startsWith("s3")) {
      const segments = key.split("/").filter(Boolean);
      bucket = segments.shift();
      key = segments.join("/");
    } else if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      const segments = key.split("/").filter(Boolean);
      bucket = segments.shift();
      key = segments.join("/");
    } else if (parsed.hostname.endsWith(".amazonaws.com")) {
      bucket = hostParts[0];
    }

    key = key.replace(/^\/+/, "");

    if (!bucket || !key) {
      return null;
    }

    return { bucket, key };
  } catch (error) {
    return null;
  }
}

async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function downloadFromS3(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await s3.send(command);

  if (!response.Body) {
    throw new Error("S3 object body is empty");
  }

  const buffer = await streamToBuffer(response.Body);
  const contentType = response.ContentType || DEFAULT_CONTENT_TYPE;
  const fileName = path.basename(key) || deriveFileNameFromUrl(key);

  return { buffer, contentType, fileName };
}

async function downloadViaHttp(imageUrl) {
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: FACE_VERIFIER_TIMEOUT_MS,
  });

  const contentType = response.headers["content-type"] || DEFAULT_CONTENT_TYPE;
  const fileName = deriveFileNameFromUrl(imageUrl);
  const buffer = Buffer.from(response.data);
  return { buffer, contentType, fileName };
}

async function fetchImageData(imageUrl) {
  if (!imageUrl?.trim()) {
    throw new Error("Image URL is required for face registration");
  }

  const normalizedUrl = imageUrl.trim();
  const s3Meta = parseS3Url(normalizedUrl);

  if (s3Meta) {
    try {
      return await downloadFromS3(s3Meta.bucket, s3Meta.key);
    } catch (error) {
      console.warn("Failed to fetch image from S3, falling back to HTTP", error);
    }
  }

  return downloadViaHttp(normalizedUrl);
}

export async function registerFaceEmbedding(employeeId, imageUrl) {
  if (!employeeId) {
    throw new Error("employeeId is required for face registration");
  }
  if (!imageUrl?.trim()) {
    throw new Error("profile image URL is required for face registration");
  }

  const { buffer, contentType, fileName } = await fetchImageData(imageUrl);

  const form = new FormData();
  form.append("employeeId", employeeId);
  form.append("image", buffer, {
    filename: fileName,
    contentType,
  });

  await axios.post(`${FACE_VERIFIER_URL}/register`, form, {
    headers: form.getHeaders(),
    timeout: FACE_VERIFIER_TIMEOUT_MS,
  });
}
