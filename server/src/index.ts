import "dotenv/config";
import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhooks.js";
import topicRoutes from "./routes/topics.js";
import dailyRoutes from "./routes/daily.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));

app.use("/webhooks", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/webhooks", webhookRoutes);
app.use("/topics", topicRoutes);
app.use("/daily", dailyRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
