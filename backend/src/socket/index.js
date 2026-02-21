const { Server } = require("socket.io");

/**
 * Initialize Socket.io
 * @param {http.Server} server
 */
const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*", // tighten later in production
            methods: ["GET", "POST"],
        },
    });

    // Make io accessible globally (controllers will use this)
    global.io = io;

    io.on("connection", (socket) => {
        console.log("🟢 Socket connected:", socket.id);

        /**
         * Join user-specific room
         * userId = Employee / HR / Admin _id
         */
        socket.on("join", (userId) => {
            if (!userId) return;
            socket.join(userId);
            console.log(`👤 User joined room: ${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("🔴 Socket disconnected:", socket.id);
        });
    });
};

module.exports = initSocket;
