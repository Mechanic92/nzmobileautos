import crypto from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireAdminOrThrow } from "@/server/adminGuard";
import { getPublicAssetBaseUrl, getS3Bucket, getS3Client } from "@/server/storage";

const BodySchema = z.object({
  reportId: z.string().min(1),
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeExtFromContentType(ct: string) {
  if (ct === "image/jpeg") return "jpg";
  if (ct === "image/png") return "png";
  if (ct === "image/webp") return "webp";
  return "bin";
}

export async function POST(req: Request) {
  await requireAdminOrThrow();
  const body = BodySchema.parse(await req.json());

  if (body.sizeBytes > MAX_BYTES) return new NextResponse("File too large", { status: 400 });
  if (!ALLOWED_CONTENT_TYPES.has(body.contentType)) return new NextResponse("Unsupported file type", { status: 400 });

  const s3 = getS3Client();
  const bucket = getS3Bucket();
  const publicBase = getPublicAssetBaseUrl();
  if (!s3 || !bucket || !publicBase) {
    return new NextResponse("Storage not configured", { status: 500 });
  }

  const ext = safeExtFromContentType(body.contentType);
  const objectKey = `reports/${body.reportId}/${crypto.randomUUID()}.${ext}`;

  const put = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: body.contentType,
    ContentLength: body.sizeBytes,
  });

  const uploadUrl = await getSignedUrl(s3, put, { expiresIn: 60 * 5 });
  const publicUrl = `${publicBase.replace(/\/$/, "")}/${objectKey}`;

  return NextResponse.json({
    uploadUrl,
    publicUrl,
    objectKey,
    contentType: body.contentType,
  });
}
