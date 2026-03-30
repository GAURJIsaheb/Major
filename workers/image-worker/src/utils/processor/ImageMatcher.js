import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  CompareFacesCommand,
  RekognitionClient,
} from "@aws-sdk/client-rekognition";
import SysConf from "../../conf/config.js";

const Config = new SysConf().MustLoad();
const s3Client = new S3Client({
  region: Config.S3_REGION,
  endpoint: Config.S3_ENDPOINT || undefined,
  forcePathStyle: Config.S3_FORCE_PATH_STYLE,
});
const rekognitionClient = new RekognitionClient({
  region: Config.REKOGNITION_REGION,
});

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

  return Buffer.concat(chunks);
}

async function MatchFaces(profileLocation, punchLocation) {
  if (
    !profileLocation?.bucket ||
    !profileLocation?.key ||
    !punchLocation?.bucket ||
    !punchLocation?.key
  ) {
    return {
      match: false,
      similarity: null,
      error: "Missing image references for Rekognition",
    };
  }

  try {
    const [sourceBuffer, targetBuffer] = await Promise.all([
      downloadBuffer(profileLocation.bucket, profileLocation.key),
      downloadBuffer(punchLocation.bucket, punchLocation.key),
    ]);

    const command = new CompareFacesCommand({
      SourceImage: { Bytes: sourceBuffer },
      TargetImage: { Bytes: targetBuffer },
      SimilarityThreshold: 80,
    });

    const { FaceMatches } = await rekognitionClient.send(command);
    const faceMatch = FaceMatches?.[0];

    return {
      match: Boolean(faceMatch),
      similarity: faceMatch?.Similarity
        ? Number(faceMatch.Similarity.toFixed(4))
        : null,
    };
  } catch (error) {
    const detail =
      error?.name && error?.message
        ? `${error.name}: ${error.message}`
        : error?.message || "Unknown Rekognition error";
    console.error("Recognition CompareFaces failed:", detail);
    return {
      match: false,
      similarity: null,
      error: detail,
    };
  }
}

export default MatchFaces;
