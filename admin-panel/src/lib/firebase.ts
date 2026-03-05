// lib/firebase.ts

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const hasMessagingConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId
);

let app: FirebaseApp | null = null;
if (hasMessagingConfig) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}


export const getClientMessaging = (): Messaging | null => {
  if (
    !hasMessagingConfig ||
    !app ||
    typeof window === "undefined" ||
    !("serviceWorker" in navigator)
  ) {
    return null;
  }
  return getMessaging(app);
};
