import { API_URL } from "@/lib/constants";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

function baseWsUrl() {
  return API_URL.replace(/\/$/, "");
}

let socket: Socket | null = null;

export function connectRealtime(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(baseWsUrl(), {
    path: "/ws",
    transports: ["websocket"],
    auth: { token },
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return socket;
}

export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
}
