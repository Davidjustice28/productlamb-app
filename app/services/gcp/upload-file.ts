import { BaseResponse } from "~/types/base.types";
import { GCP_CONFIG } from "./config";



export const uploadToPhotoToCloudStorage = async (photoFile: File): Promise<BaseResponse<string>> => {
  const buffer = await photoFile.arrayBuffer();
  const config = new GCP_CONFIG();
  const bucketName = config.appImagesBucket;
  const fileName = `${Date.now()}-${photoFile.name}`
  try {
    const bucket = config.bucket; // Removed "gs://" from the bucket name
    const file = bucket.file(fileName)
    const uploadStream = file.createWriteStream({
      resumable: false,
      gzip: true,
      metadata: {
          contentType: photoFile.type,
      },
    })

    await new Promise<void>((resolve, reject) => {
      uploadStream.end(Buffer.from(buffer));
      uploadStream.on('error', reject);
      uploadStream.on('finish', () => {
          resolve();
      });
    });
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    return {data: publicUrl , errors: []}
  } catch (error) {
    return {data: undefined, errors: [2]}
  }
}