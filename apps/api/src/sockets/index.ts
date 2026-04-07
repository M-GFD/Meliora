import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@meliora/shared-types";

export function registerSocketHandlers(
  io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
): void {
  io.on("connection", (socket) => {
    socket.on("space:join", (spaceId: string) => {
      void socket.join(`space:${spaceId}`);
    });
    socket.on("space:leave", (spaceId: string) => {
      void socket.leave(`space:${spaceId}`);
    });
  });
}
