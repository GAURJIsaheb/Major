import axios from "axios";
import fs from "fs";
import path from "path";

const RESUMES_DIR = "./resumes";
const PLACEHOLDER_PATTERN = /placehold\\.co/i;
const DOWNLOAD_TIMEOUT_MS = 15_000;

const CONTENT_TYPE_MAPPING = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "image/svg+xml": ".svg",
};

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

function ensureResumesFolder() {
  if (!fs.existsSync(RESUMES_DIR)) {
    fs.mkdirSync(RESUMES_DIR, { recursive: true });
  }
}

function normalizeContentType(value) {
  if (!value) return null;
  return value.split(";")[0].trim().toLowerCase();
}

function resolveExtension(fileUrl, contentType) {
  const inferred = contentType ? CONTENT_TYPE_MAPPING[contentType] : null;
  if (inferred && ALLOWED_EXTENSIONS.has(inferred)) {
    return inferred;
  }

  try {
    const parsedUrl = new URL(fileUrl);
    const urlExt = path.extname(parsedUrl.pathname).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(urlExt)) {
      return urlExt;
    }
  } catch (error) {
    // fallback to naive extraction
    const urlExt = path.extname(fileUrl.split("?")[0]).toLowerCase();
    if (ALLOWED_EXTENSIONS.has(urlExt)) {
      return urlExt;
    }
  }

  return null;
}

async function DownloadFile(fileUrl, UserId, OpeningId) {
  if (!fileUrl) {
    console.warn(`[Resume] No resume URL provided for ${UserId} - skipping`);
    return null;
  }

  if (PLACEHOLDER_PATTERN.test(fileUrl)) {
    console.warn(`[Resume] Detected placeholder URL for ${UserId} - skipping (${fileUrl})`);
    return null;
  }

  try {
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
      timeout: DOWNLOAD_TIMEOUT_MS,
    });

    const contentType = normalizeContentType(response.headers["content-type"]);
    const extension = resolveExtension(fileUrl, contentType);

    if (!extension) {
      console.warn(`[Resume] Unsupported resume format (${contentType || "unknown"}) from ${fileUrl} - skipping`);
      return null;
    }

    ensureResumesFolder();

    const filePath = `${RESUMES_DIR}/${UserId}_${OpeningId}${extension}`;
    fs.writeFileSync(filePath, response.data);

    console.log(`[Resume] File downloaded successfully to ${filePath}`);

    return filePath;
  } catch (error) {
    console.error(`[Resume] Error downloading file for ${UserId}:`, error?.message || error);
    return null;
  }
}

export default DownloadFile;
