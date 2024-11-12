import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { replaceName } from './replaceName';
import { fs, storage } from '@/firebase/firebaseConfig';
import { addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { handleResize } from './resizeImage';
import path from 'path';

export class HandleFile {
  static HandleFiles = async (files: any, id: string, collectionName: string) => {
    const items: any[] = [];

    for (const i in files) {
      if (files[i].size && files[i].size > 0) {
        items.push(files[i]);
      }
    }

    const ids: string[] = [];

    items.forEach(async item => {
      const newFile = await handleResize(item);
      await this.UploadToStore(newFile, id, collectionName);
    });
  };

  static UploadToStore = async (file: any, id: string, collectionName: string) => {
    const filename = replaceName(file.name);
    const path = `/images/${filename}`;
    const storageRef = ref(storage, path);

    const res = await uploadBytes(storageRef, file);

    if (res) {
      if (res.metadata.size === file.size) {
        const url = await getDownloadURL(storageRef);
        await this.SaveToFirestore({ downloadUrl: url, path, id, name: collectionName });
      } else {
        return 'uploading';
      }
    } else {
      return 'Error upload';
    }
  };

  static SaveToFirestore = async ({ path, downloadUrl, id, name }: { path: string, downloadUrl: string, id: string; name: string; }) => {
    try {
      await updateDoc(doc(fs, `${name}/${id}`), {
        files: arrayUnion({
          path,
          downloadUrl
        }),
        imageUrl: downloadUrl,
        updatedAt: Date.now()
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
          await deleteObject(ref(storage, `${path}`));

          await deleteDoc(doc(fs, `files/${id}`));

        }
      }
    } catch (error) {
      console.log(error);
    }
  };
}