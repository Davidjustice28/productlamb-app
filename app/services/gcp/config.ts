import { Storage } from "@google-cloud/storage";
import { SpeechClient } from '@google-cloud/speech';

export class GCP_CONFIG {
  public appImagesBucket = "productlamb_project_images"
  storage = new Storage({
    credentials: JSON.parse(process.env.GCP_CREDENTIALS || "")
  });
  speech = new SpeechClient({
    credentials: JSON.parse(process.env.GCP_CREDENTIALS || "")
  });


  public get bucket() {
    return this.storage.bucket(this.appImagesBucket);
  }
}