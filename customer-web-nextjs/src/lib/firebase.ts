import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

declare global {
  interface Window {
    __FIREBASE_ANALYTICS_READY__?: boolean;
    __FIREBASE_ANALYTICS_MEASUREMENT_ID__?: string;
    __FIREBASE_ANALYTICS_ERROR__?: string;
  }
}

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyA2eGIc4izwNijDz9fkElpUotaMPrJmWu8",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "sportoonline-e6793.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "sportoonline-e6793",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "sportoonline-e6793.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "56680667994",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:56680667994:web:8c9510f7523412b736b163",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LWK0WH3C4Z",
};

const FIREBASE_APP_NAME = "sportoonline";

function getFirebaseApp(): FirebaseApp {
  const existingApp = getApps().find((app) => app.name === FIREBASE_APP_NAME);
  if (existingApp) return existingApp;

  try {
    return getApp(FIREBASE_APP_NAME);
  } catch {
    return initializeApp(firebaseConfig, FIREBASE_APP_NAME);
  }
}

export async function initializeFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;

  window.__FIREBASE_ANALYTICS_MEASUREMENT_ID__ =
    firebaseConfig.measurementId || "";

  if (!firebaseConfig.apiKey || !firebaseConfig.appId || !firebaseConfig.measurementId) {
    window.__FIREBASE_ANALYTICS_READY__ = false;
    window.__FIREBASE_ANALYTICS_ERROR__ = "missing-config";
    return null;
  }

  try {
    const supported = await isSupported();
    if (!supported) {
      window.__FIREBASE_ANALYTICS_READY__ = false;
      window.__FIREBASE_ANALYTICS_ERROR__ = "unsupported-browser";
      return null;
    }

    const analytics = getAnalytics(getFirebaseApp());
    window.__FIREBASE_ANALYTICS_READY__ = true;
    window.__FIREBASE_ANALYTICS_ERROR__ = undefined;
    return analytics;
  } catch (error) {
    window.__FIREBASE_ANALYTICS_READY__ = false;
    window.__FIREBASE_ANALYTICS_ERROR__ =
      error instanceof Error ? error.message : "unknown-error";
    return null;
  }
}
