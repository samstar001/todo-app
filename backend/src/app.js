import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import env from "./config/env.js";
import errorHandler from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

// API routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Serve the frontend (backend/src -> ../../frontend)
const frontendPath = path.join(__dirname, "..", "..", "frontend");
app.use(express.static(frontendPath));

// Unknown /api routes get a JSON 404
app.use("/api", (req, res) => {
  res.status(404).json({ error: { message: "Route not found", status: 404 } });
});

// Must be last
app.use(errorHandler);

export default app;
