import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, onMessage, getToken } from 'firebase/messaging';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_apiKey,
  authDomain: process.env.NEXT_PUBLIC_authDomain,
  projectId: process.env.NEXT_PUBLIC_projectId,
  storageBucket: process.env.NEXT_PUBLIC_storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
  appId: process.env.NEXT_PUBLIC_appId
};


const app = initializeApp(firebaseConfig);
let messaging;
if (typeof window !== "undefined") {
  messaging = getMessaging(app);
}export { messaging, onMessage, getToken };

export const auth = getAuth();
auth.languageCode = "vi";
export const fs = getFirestore(app);
export const storage = getStorage();


