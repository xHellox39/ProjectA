import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';

const serviceAccount = require('../../../firebase-service-account.json');

let initializedApp: App;

if (getApps().length === 0) {
  initializedApp = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  initializedApp = getApps()[0];
}

export async function verifyFirebaseToken(
  token: string
): Promise<string> {
  const decodedToken = await getAuth(initializedApp)
    .verifyIdToken(token);

  return decodedToken.uid;
}

export { getAuth, DecodedIdToken };