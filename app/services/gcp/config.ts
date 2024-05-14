import { Storage } from "@google-cloud/storage";

export class GCP_CONFIG {
  public appImagesBucket = "productlamb_project_images"
  storage = new Storage({
    projectId: "product-lamb",
    keyFilename: "product-lamb-3d9ce494ce5f.json",
  });

  public get bucket() {
    return this.storage.bucket(this.appImagesBucket);
  }
}