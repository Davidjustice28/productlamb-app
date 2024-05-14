import { GCP_CONFIG } from "./config";

export async function deleteFileFromCloudStorage(fileUrl: string): Promise<{ success: boolean }>{
    const config = new GCP_CONFIG()
    const bucket = config.bucket;
    const file = bucket.file(fileUrl);

    try {
      await file.delete();
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
}