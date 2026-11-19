import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://employee-management-system-seven-tan.vercel.app"
];

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(url => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [...defaultOrigins, ...envOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/+$/, "");
    if (
      allowedOrigins.includes(normalized) ||
      /^https:\/\/[a-zA-Z0-9_.-]+\.vercel\.app$/.test(normalized)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : "An unexpected server error occurred."
  });
});

export default app;