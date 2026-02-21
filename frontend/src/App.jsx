import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import { connectSocket } from "./services/socket";
import { useAuthStore } from "./store/authStore";
import useSyncUser from "./hooks/useSyncUser";
import CookieBanner from "./components/ui/CookieBanner";

function App() {
    const { user } = useAuthStore();
    useSyncUser();

    useEffect(() => {
        if (user?._id) {
            connectSocket(user._id);
        }
    }, [user]);

    return (
        <>
            <AppRoutes />
            <CookieBanner />
        </>
    );
}

export default App;