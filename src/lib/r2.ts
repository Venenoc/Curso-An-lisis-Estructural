import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(params: {
  file: File;
  key: string;
  contentType: string;
}): Promise<string> {
  const buffer = Buffer.from(await params.file.arrayBuffer());
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.CF_R2_BUCKET_NAME!,
      Key: `public/${params.key}`,
      Body: buffer,
      ContentType: params.contentType,
    })
  );
  return `${process.env.NEXT_PUBLIC_CF_R2_PUBLIC_URL}/${params.key}`;
}
