import { initializeApp } from "firebase/app";
import { deleteObject, uploadString } from "firebase/storage";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import dotenv from "dotenv";
import multer from "multer";
import { AppError } from "./error";
import { NextFunction } from "express";

dotenv.config();

const multerConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    // fileSize: 10 * 1024 * 1024,
    fileSize: 20 * 1024 * 1024,
  },
});
export const uploadFile = multerConfig.single("file");
export const uploadFiles = multerConfig.array("files");

export class Upload {
  firebaseStorage;
  filePath;
  upload;
  next;

  constructor(filePath: string, next: NextFunction) {
    const firebaseConfig = {
      apiKey: process.env.API_KEY,
      authDomain: process.env.AUTH_DOMAIN,
      projectId: process.env.PROJECT_ID,
      storageBucket: process.env.STORAGE_BUCKET,
      messagingSenderId: process.env.MESSAGING_SENDER_ID,
      appId: process.env.APP_ID,
      measurementId: process.env.MEASUREMENT_ID,
    };
    const firebaseApp = initializeApp(firebaseConfig);
    this.firebaseStorage = getStorage(firebaseApp);
    this.filePath = filePath;
    this.upload = { url: "" };
    this.next = next;
  }

  bufferToBase64(buffer: any) {
    return Buffer.from(buffer).toString("base64");
  }

  path(filePath: string) {
    const isProduction = process.env.NODE_ENV === "production";
    if (!filePath) {
      this.next(new AppError("No file path provided!", 500));
    }
    if (filePath.startsWith("/")) {
      this.next(new AppError("Invalid file path!", 500));
    }
    if (isProduction) return `prod/${filePath}`;
    if (!isProduction) return `dev/${filePath}`;
  }

  async add(file: any) {
    try {
      const reference = ref(this.firebaseStorage, this.path(this.filePath));
      const fileBase64 = this.bufferToBase64(file.buffer);

      await uploadString(reference, fileBase64, "base64");
      this.upload.url = await getDownloadURL(reference);

      return this.upload;
    } catch (err) {
      console.log("err", err);
      if (err)
        return this.next(
          new AppError("Sorry, error occurred while uploading!", 500)
        );
    }
  }

  async update(file: any, savedFilePath: string) {
    try {
      let reference = ref(this.firebaseStorage, this.path(this.filePath));
      const fileBase64 = this.bufferToBase64(file.buffer);
      await uploadString(reference, fileBase64, "base64");
      const URL = await getDownloadURL(reference);

      // delete the saved file
      reference = ref(this.firebaseStorage, this.path(savedFilePath));
      if (URL) {
        await deleteObject(reference);
      }
      this.upload.url = URL;

      return this.upload;
    } catch (err) {
      console.log("err", err);
      if (err)
        return this.next(
          new AppError("Sorry, error occurred while uploading!", 500)
        );
    }
  }

  async delete() {
    try {
      const reference = ref(this.firebaseStorage, this.path(this.filePath));
      await deleteObject(reference);
    } catch (err) {
      console.log("err", err);
      this.next(new AppError("Sorry, error occurred while deleting!", 500));
    }
  }
}
