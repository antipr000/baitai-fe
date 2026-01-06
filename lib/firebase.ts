import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { clientConfig } from '@/lib/auth/config';

// Initialize Firebase
const app = !getApps().length ? initializeApp(clientConfig) : getApp();
export const auth = getAuth(app);