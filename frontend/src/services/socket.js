import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
    if (socket) return socket;

    socket = io(import.meta.env.VITE_API_URL, {
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("🟢 Socket connected:", socket.id);
        socket.emit("join", userId);
    });

    socket.on("disconnect", () => {
        console.log("🔴 Socket disconnected");
    });

    return socket;
};

export const getSocket = () => socket;
