import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@meliora/shared-types";
import { verifyToken } from "../utils/jwt.js";

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
): void {
  io.on("connection", (socket) => {
    const token = (socket.handshake.auth as { token?: unknown } | undefined)?.token;
    if (typeof token === "string" && token) {
      try {
        const payload = verifyToken(token);
        socket.data.userId = payload.sub;
        void socket.join(`user:${payload.sub}`);
      } catch {
        // Ignore invalid token; allow anonymous realtime for public rooms.
      }
    }

    socket.on("space:join", (spaceId: string) => {
      void socket.join(`space:${spaceId}`);
    });
    socket.on("space:leave", (spaceId: string) => {
      void socket.leave(`space:${spaceId}`);
    });
  });
}
