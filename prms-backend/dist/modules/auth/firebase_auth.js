"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuth = void 0;
exports.verifyFirebaseToken = verifyFirebaseToken;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
Object.defineProperty(exports, "getAuth", { enumerable: true, get: function () { return auth_1.getAuth; } });
const config_1 = require("../../config");
// Initialize Firebase Admin SDK (v14 API) - only once, shared across modules
let initializedApp;
if ((0, app_1.getApps)().length === 0) {
    initializedApp = (0, app_1.initializeApp)({
        credential: process.env.GCP_SA_KEY
            ? JSON.parse(process.env.GCP_SA_KEY)
            : (0, app_1.applicationDefault)(),
        projectId: config_1.env.FIREBASE_PROJECT_ID,
    });
}
else {
    initializedApp = (0, app_1.getApps)()[0];
}
function verifyFirebaseToken(token) {
    return (0, auth_1.getAuth)(initializedApp).verifyIdToken(token).then((decodedToken) => decodedToken.uid);
}
