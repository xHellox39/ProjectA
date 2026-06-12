import "dotenv/config";

export const env = {
  PORT: process.env.PORT || "3500",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
};
