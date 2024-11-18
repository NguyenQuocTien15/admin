import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId
};

// Khởi tạo Firebase app
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
const auth = getAuth(app);
const fs = getFirestore(app);
const storage = getStorage(app);

// Khởi tạo Firebase Messaging
let messaging;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}

// Xuất các đối tượng và phương thức cần thiết
export { auth, fs, storage, messaging, onMessage, getToken };
