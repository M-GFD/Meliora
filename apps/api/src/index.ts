import { env } from "./bootstrapEnv.js";
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
import { requestId } from "./middleware/requestId.js";
import { authRouter } from "./routes/auth.js";
import { postsRouter } from "./routes/posts.js";
import { clustersRouter } from "./routes/clusters.js";
import { consensusRouter } from "./routes/consensus.js";
import { notificationsRouter } from "./routes/notifications.js";
import { usersRouter } from "./routes/users.js";
import { setIo } from "./realtime/io.js";
import { registerSocketHandlers } from "./sockets/index.js";
import { prisma } from "./lib/prisma.js";

const app = express();
const server = http.createServer(app);

const corsOrigin = env.CORS_ORIGIN;

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: { origin: corsOrigin, methods: ["GET", "POST"] },
});

setIo(io);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(requestId);
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ method: req.method, path: req.path }));
  next();
});
app.use(express.json({ limit: "256kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "meliora-api" });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: "meliora-api", database: "up" });
  } catch {
    res.status(503).json({ ok: false, service: "meliora-api", database: "down" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/clusters", clustersRouter);
app.use("/api/consensus", consensusRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);

app.use(errorHandler);

registerSocketHandlers(io);

const port = env.PORT;
server.listen(port, () => {
  console.log(`Meliora API listening on http://localhost:${port}`);
});
