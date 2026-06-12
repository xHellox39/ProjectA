import express from "express";
import cors from "cors";
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase if not already initialized (firebase_auth.ts may have done it first)
if (getApps().length === 0) {
  initializeApp({
    credential: process.env.GCP_SA_KEY
      ? JSON.parse(process.env.GCP_SA_KEY)
      : applicationDefault(),
  });
}

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", (req, res) => {
  res.status(200).json({ health: "ok" });
});

app.get("/", (req, res) => {
    res.json({
        app: "PRMS Backend",
        version: "1.0.0",
        status: "running"
    });
});

// Auth route
router.post("/auth/verify", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({
        error: "Missing Firebase token"
      });
    }
    
    const decodedToken = await getAuth().verifyIdToken(token);
    res.json({
      userId: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    });
  }
  catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({
      error: "Invalid Firebase token"
    });
  }
});

app.use(router);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
