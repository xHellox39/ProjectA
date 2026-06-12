import { initializeApp, applicationDefault, App, getApps } from "firebase-admin/app";
import { getAuth, DecodedIdToken } from "firebase-admin/auth";
import { env } from "../../config";

// Initialize Firebase Admin SDK (v14 API) - only once, shared across modules
let initializedApp: App;
if (getApps().length === 0) {
  initializedApp = initializeApp({
    credential: process.env.GCP_SA_KEY
      ? JSON.parse(process.env.GCP_SA_KEY)
      : applicationDefault(),
    projectId: env.FIREBASE_PROJECT_ID,
  });
} else {
  initializedApp = getApps()[0];
}

export function verifyFirebaseToken(token: string): Promise<string> {
  return getAuth(initializedApp).verifyIdToken(token).then((decodedToken) => decodedToken.uid);
}

export { getAuth, DecodedIdToken };
