import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { clientConfig } from '@/lib/auth/config';

// Initialize Firebase only if configuration is available
let app;
let auth;

try {
  // Check if required config is present
  if (clientConfig.apiKey && clientConfig.projectId) {
    app = !getApps().length ? initializeApp(clientConfig) : getApp();
    auth = getAuth(app);
  } else {
    console.warn(
      "[Firebase] Missing Firebase configuration. " +
      "Please set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variables."
    );
    // Create a mock auth object to prevent errors
    auth = null as any;
  }
} catch (error) {
  console.error("[Firebase] Error initializing Firebase:", error);
  auth = null as any;
}

export { auth };