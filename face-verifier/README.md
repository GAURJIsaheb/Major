# Face Verification Service

Self-hosted FastAPI microservice that replaces AWS Rekognition with DeepFace (Facenet) for 1:1 verification. The service stores embeddings in MongoDB and exposes `/register` and `/verify` endpoints that accept `multipart/form-data`.

## Environment

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/admin`). |
| `MONGODB_DB` | Database name (default `face_verifier`). |
| `FACE_COLLECTION` | Collection name for embeddings (default `face_embeddings`). |
| `FACE_MODEL_NAME` | DeepFace model (default `Facenet`). |
| `FACE_DETECTOR_BACKEND` | DeepFace detector backend (default `mtcnn`). |
| `FACE_MATCH_THRESHOLD` | Cosine similarity threshold (default `0.6`). |
| `FACE_HOST` / `FACE_PORT` | Uvicorn host/port (defaults `0.0.0.0`/`8001`). |

Create a `.env` file in this directory or export the variables before starting the app.

## Setup

```bash
cd face-verifier
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --host ${FACE_HOST:-0.0.0.0} --port ${FACE_PORT:-8001} --reload
```

## API

### `POST /register`

Registers or updates an employee embedding from the provided profile photo.

- **Form fields**:
  - `employeeId` (string)
  - `image` (file, JPEG/PNG)
- **Response**: `{ "employeeId": "...", "updated": true }`

### `POST /verify`

Uses the stored embedding to verify a live photo.

- **Form fields**:
  - `employeeId` (string)
  - `image` (file, live selfie)
- **Response**:
  ```json
  {
    "match": true,
    "confidence": 0.72,
    "threshold": 0.6
  }
  ```
`match` is `true` when the cosine similarity meets or exceeds the threshold.

## MongoDB Schema

Document stored in `${FACE_COLLECTION}`:

```json
{
  "employeeId": "60f7c2cf2e9f2c001c7b8b34",
  "embedding": [0.0012, -0.034, 0.221, ...],
  "updatedAt": "2026-03-30T10:45:00.123Z"
}
```

The service automatically creates a unique index on `employeeId`.

## Integration Notes

- Use `POST /register` when a profile photo is created or updated to keep embeddings in sync.
- `workers/image-worker` now posts live punch images to `/verify` and caches the result in Redis for the async attendance flow.
- When integrating with other Node/Express controllers you can reuse a simple helper that streams `multipart/form-data` to `/verify`.

```js
// backend/src/modules/Attendance/Controllers/Attendance.controllers.js
import axios from "axios";
import FormData from "form-data";

async function verifyLivePunch(employeeId, imageBuffer, baseUrl) {
  const form = new FormData();
  form.append("employeeId", employeeId);
  form.append("image", imageBuffer, {
    filename: "punch.jpg",
    contentType: "image/jpeg",
  });

  const { data } = await axios.post(`${baseUrl}/verify`, form, {
    headers: form.getHeaders(),
    timeout: 15_000,
  });

  return data;
}

// inside the punch controller (before stamping OUT)
const liveImageBuffer = Buffer.from(base64LivePhoto, "base64");
const verification = await verifyLivePunch(req.user.id, liveImageBuffer, process.env.FACE_VERIFIER_URL);
if (!verification.match) {
  throw new ApiError(Types.Errors.Forbidden, "Face verification failed");
}
```
