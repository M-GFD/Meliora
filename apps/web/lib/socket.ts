"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): typeof socket {
  if (typeof window === "undefined") {
    return null;
  }
  const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
  if (!socket) {
    socket = io(url, { transports: ["websocket", "polling"] });
  }
  return socket;
}
