"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let lastToken: string | null = null;

export function getSocket(token?: string | null): typeof socket {
  if (typeof window === "undefined") {
    return null;
  }
  const url = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
  if (!socket) {
    lastToken = token ?? null;
    socket = io(url, {
      transports: ["websocket", "polling"],
      auth: lastToken ? { token: lastToken } : undefined,
    });
  } else if ((token ?? null) !== lastToken) {
    lastToken = token ?? null;
    socket.auth = lastToken ? { token: lastToken } : {};
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();
  }
  return socket;
}
