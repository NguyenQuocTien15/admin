import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { replaceName } from "./replaceName";

import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { handleResize } from "./resizeImage";
import { fs, storage } from "@/firebase/firebaseConfig";

export class HandleFile {
  static async upload(file: any, path: string): Promise<string> {
    try {
      if (!file) {
        throw new Error("No file provided for upload.");
      }

      const storage = getStorage(); // Initialize Firebase Storage
      const storageRef = ref(storage, `${path}/${file.name || Date.now()}`);

      // Upload the file to Firebase Storage
      const snapshot = await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("File upload failed:", error);
      throw new Error("Failed to upload file.");
    }
  }
  static async uploadSingleFile(file: any, path: string): Promise<string> {
    try {
      const resizedFile = await handleResize(file); // Resize the image if necessary
      const filename = replaceName(file.name);
      const storagePath = `${path}/${filename}`;
      const storageRef = ref(storage, storagePath);

      const uploadResult = await uploadBytes(storageRef, resizedFile);
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      return downloadUrl; // Return the download URL
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("File upload failed.");
    }
  }

  static HandleFiles = async (
    files: any,
    id: string,
    collectionName: string
  ) => {
    const items = files.filter((file: any) => file.size && file.size > 0);

    for (const item of items) {
      const newFile = await handleResize(item);
      await this.UploadToStore(newFile, id, collectionName);
    }
  };

  static UploadToStore = async (
    file: any,
    id: string,
    collectionName: string
  ) => {
    const filename = replaceName(file.name);
    const storagePath = `/images/${filename}`;
    const storageRef = ref(storage, storagePath);

    const res = await uploadBytes(storageRef, file);
    if (res) {
      if (res.metadata.size === file.size) {
        const url = await getDownloadURL(storageRef);
        await this.SaveToFirestore({
          downloadUrl: url,
          path: storagePath,
          id,
          name: collectionName,
        });
      } else {
        return "uploading";
      }
    } else {
      return "Error upload";
    }
  };

  static SaveToFirestore = async ({
    path,
    downloadUrl,
    id,
    name,
  }: {
    path: string;
    downloadUrl: string;
    id: string;
    name: string;
  }) => {
    try {
      await updateDoc(doc(fs, `${name}/${id}`), {
        files: arrayUnion({
          path,
          downloadUrl,
        }),
        imageUrl: downloadUrl,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.log(error);
    }
  };

  static removeFile = async (id: string) => {
    try {
      const snap = await getDoc(doc(fs, `files/${id}`));
      if (snap.exists()) {
        const { path, downloadUrl } = snap.data();

        if (path) {
          await deleteObject(ref(storage, path));
          await deleteDoc(doc(fs, `files/${id}`));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
}
