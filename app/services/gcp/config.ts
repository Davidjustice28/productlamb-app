import { Storage } from "@google-cloud/storage";

export class GCP_CONFIG {
  public appImagesBucket = "productlamb_project_images"
  storage = new Storage({
    credentials: JSON.parse(process.env.GCP_CREDENTIALS || "")
  });

  public get bucket() {
    return this.storage.bucket(this.appImagesBucket);
  }
}