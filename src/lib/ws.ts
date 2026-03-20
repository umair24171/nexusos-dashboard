import io, { Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";

let socket: Socket | null = null;

export const wsClient = {
  connect: (): Socket => {
    if (!socket || !socket.connected) {
      socket = io(WS_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on("connect", () => {
        console.log("WebSocket connected");
      });

      socket.on("disconnect", () => {
        console.log("WebSocket disconnected");
      });

      socket.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
    }
    return socket;
  },

  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  on: (event: string, callback: (data: any) => void): void => {
    const activeSocket = wsClient.connect();
    activeSocket.on(event, callback);
  },

  off: (event: string, callback?: (data: any) => void): void => {
    if (socket) {
      callback ? socket.off(event, callback) : socket.off(event);
    }
  },

  emit: (event: string, data: any): void => {
    const activeSocket = wsClient.connect();
    activeSocket.emit(event, data);
  },

  getSocket: (): Socket | null => socket,
};

export default wsClient;
