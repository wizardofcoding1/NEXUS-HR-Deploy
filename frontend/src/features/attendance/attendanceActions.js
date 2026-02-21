import { getSocket } from "../../services/socket";

// Employee Check-In
export const checkIn = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("attendance:checkin");
};

// Employee Check-Out
export const checkOut = () => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("attendance:checkout");
};
