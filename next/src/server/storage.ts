import { S3Client } from "@aws-sdk/client-s3";

export function getS3Client() {
  const region = process.env.S3_REGION || "auto";
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region,
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function getS3Bucket() {
  return process.env.S3_BUCKET || "";
}

export function getPublicAssetBaseUrl() {
  return process.env.S3_PUBLIC_BASE_URL || "";
}
