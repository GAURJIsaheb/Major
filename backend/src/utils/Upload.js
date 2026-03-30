import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "./s3.js";

const DEFAULT_BUCKET = process.env.S3_BUCKET;
const PROFILE_PHOTO_BUCKET = process.env.PROFILE_PHOTO_BUCKET ?? DEFAULT_BUCKET;
const DEFAULT_PRESIGNED_EXPIRES = Number(process.env.S3_PRESIGNED_EXPIRES) || 300;

export async function createPresignedUploadUrl({
  key,
  contentType = "image/jpeg",
  bucketName,
  expiresIn,
}) {
  const targetBucket = bucketName ?? DEFAULT_BUCKET;
  if (!targetBucket) {
    throw new Error("S3_BUCKET must be configured before creating upload URLs");
  }

  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: expiresIn ?? DEFAULT_PRESIGNED_EXPIRES,
  });
}

export async function createPunchPhotoUploadUrl({ key, contentType = "image/jpeg", expiresIn }) {
  return createPresignedUploadUrl({
    key,
    contentType,
    expiresIn,
    bucketName: process.env.PUNCH_PHOTOS_BUCKET ?? "nexushr-profile-photos ",
  });
}

export async function GenerateUploadUrl(key, contentType, bucketName) {
  return createPresignedUploadUrl({
    key,
    contentType,
    bucketName: bucketName ?? PROFILE_PHOTO_BUCKET,
  });
}
