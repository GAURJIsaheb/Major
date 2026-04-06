import axios from "axios";
import FormData from "form-data";
import SysConf from "../../conf/config.js";

const Config = new SysConf().MustLoad();
const baseUrl = Config.FACE_VERIFIER_URL;
const TIMEOUT_MS = Config.FACE_VERIFIER_TIMEOUT_MS ?? 15_000;

function ensureBaseUrl() {
  if (!baseUrl) {
    throw new Error("FACE_VERIFIER_URL is not configured");
  }
}

function normalizeAxiosError(error) {
  const apiDetail =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.response?.data?.error;
  return apiDetail || error?.message || "Face verification request failed";
}

export async function verifyFaceUsingService(employeeId, imageBuffer, contentType = "image/jpeg") {
  ensureBaseUrl();

  const form = new FormData();
  form.append("employeeId", employeeId);
  form.append("image", imageBuffer, {
    filename: `${employeeId}-live.jpg`,
    contentType,
  });

  try {
    const response = await axios.post(`${baseUrl}/verify`, form, {
      headers: form.getHeaders(),
      timeout: TIMEOUT_MS,
    });

    return response.data;
  } catch (error) {
    console.log("FULL ERROR:", error.response?.data);

    throw new Error(
      JSON.stringify(error.response?.data || error.message)
    );
  }
}
