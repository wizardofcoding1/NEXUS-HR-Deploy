import { useCallback, useEffect, useRef, useState } from "react";
import {
    getNotifications,
    markNotificationRead,
    clearNotifications,
} from "../services/notificationService";
import Icon from "./ui/Icon";
import { getSocket } from "../services/socket";
import notificationSound from "../assets/Sound/Notification.mp3";

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const audioRef = useRef(null);
    const lastCountRef = useRef(0);
    const initializedRef = useRef(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const fetchNotifications = useCallback(async () => {
        const data = await getNotifications();
        const next = Array.isArray(data) ? data : [];
        const nextUnread = next.filter((n) => !n.isRead).length;

        if (initializedRef.current) {
            if (nextUnread > lastCountRef.current && audioRef.current) {
                const audio = audioRef.current;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
        } else {
            initializedRef.current = true;
        }

        lastCountRef.current = nextUnread;
        setNotifications(next);
    }, []);

    useEffect(() => {
        const unlockAudio = () => {
            if (!audioRef.current) return;
            const audio = audioRef.current;
            audio.volume = 0.6;
            audio.muted = true;
            audio.play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.muted = false;
                })
                .catch(() => {})
                .finally(() => {
                    window.removeEventListener("click", unlockAudio);
                    window.removeEventListener("keydown", unlockAudio);
                });
        };

        window.addEventListener("click", unlockAudio);
        window.addEventListener("keydown", unlockAudio);

        const initialFetchId = setTimeout(() => {
            fetchNotifications();
        }, 0);

        const socket = getSocket();
        const refresh = () => fetchNotifications();
        const onNotificationNew = () => {
            if (audioRef.current) {
                const audio = audioRef.current;
                audio.currentTime = 0;
                audio.play().catch(() => {});
            }
            fetchNotifications();
        };

        if (socket) {
            socket.on("notification:new", onNotificationNew);
            socket.on("project:assigned", refresh);
            socket.on("project:unassigned", refresh);
            socket.on("leave:status", refresh);
        }

        return () => {
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
            clearTimeout(initialFetchId);
            if (socket) {
                socket.off("notification:new", onNotificationNew);
                socket.off("project:assigned", refresh);
                socket.off("project:unassigned", refresh);
                socket.off("leave:status", refresh);
            }
        };
    }, [fetchNotifications]);

    const handleRead = async (id) => {
        await markNotificationRead(id);
        fetchNotifications();
    };

    const handleClearAll = async () => {
        await clearNotifications();
        setNotifications([]);
    };

    return (
        <div className="relative">
            <audio ref={audioRef} src={notificationSound} preload="auto" />
            <button onClick={() => setOpen(!open)} className="relative">
                <Icon name="Bell" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
                    <div className="p-2 border-b flex items-center justify-between">
                        <span className="font-semibold">Notifications</span>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-xs text-slate-500 hover:text-slate-700"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 && (
                        <p className="p-3 text-sm text-slate-500">
                            No notifications
                        </p>
                    )}

                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`p-3 border-b text-sm cursor-pointer ${
                                n.isRead ? "bg-white" : "bg-slate-100"
                            }`}
                            onClick={() => handleRead(n._id)}
                        >
                            <p className="font-medium">{n.title}</p>
                            <p className="text-slate-600">{n.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
