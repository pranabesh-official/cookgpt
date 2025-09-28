// Import only the core app statically; dynamically import other SDKs in the browser
import { initializeApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Lazy-initialized Firebase clients (browser-only)
let auth: Auth | null = null;
let googleProvider: any | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (typeof window !== "undefined") {
  // Dynamically import to avoid bundling server-incompatible modules in the client during HMR
  import("firebase/auth").then(({ getAuth, GoogleAuthProvider }) => {
    try {
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
    } catch {
      // ignore
    }
  });
  import("firebase/firestore").then(({ getFirestore }) => {
    try {
      db = getFirestore(app);
    } catch {
      // ignore
    }
  });
  import("firebase/storage").then(({ getStorage }) => {
    try {
      storage = getStorage(app);
    } catch {
      // ignore
    }
  });
}

export { app, auth, googleProvider, db, storage };
export default app;
