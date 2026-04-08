import type { Server } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@meliora/shared-types";

export type TypedIo = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let io: TypedIo | null = null;

export function setIo(instance: TypedIo): void {
  io = instance;
}

export function getIo(): TypedIo | null {
  return io;
}

