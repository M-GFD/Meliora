import "dotenv/config";
import http from "node:http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@meliora/shared-types";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { postsRouter } from "./routes/posts.js";
import { clustersRouter } from "./routes/clusters.js";
import { consensusRouter } from "./routes/consensus.js";
import { notificationsRouter } from "./routes/notifications.js";
import { usersRouter } from "./routes/users.js";
import { registerSocketHandlers } from "./sockets/index.js";

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: { origin: corsOrigin, methods: ["GET", "POST"] },
});

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "meliora-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/clusters", clustersRouter);
app.use("/api/consensus", consensusRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);

app.use(errorHandler);

registerSocketHandlers(io);

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`Meliora API listening on http://localhost:${port}`);
});
