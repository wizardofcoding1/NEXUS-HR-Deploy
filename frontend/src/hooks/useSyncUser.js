import { useEffect } from "react";
import { getMeApi } from "../services/authServices";
import { useAuthStore } from "../store/authStore";

const useSyncUser = () => {
    const { user, hasSynced, setUser, setHasSynced } = useAuthStore();

    useEffect(() => {
        let ignore = false;
        const syncMe = async () => {
            try {
                const me = await getMeApi();
                const latest = me?.data;
                if (!latest || ignore) return;

                const hasChanged =
                    !user ||
                    latest.role !== user.role ||
                    latest.teamLeader !== user.teamLeader ||
                    latest.name !== user.name ||
                    latest.email !== user.email ||
                    latest.companyName !== user.companyName ||
                    latest.companyId !== user.companyId;

                if (hasChanged) {
                    setUser({ ...(user || {}), ...latest });
                }
                setHasSynced(true);
            } catch {
                setHasSynced(true);
            }
        };

        if (!hasSynced) syncMe();
        return () => { ignore = true; };
    }, [hasSynced, setHasSynced, setUser, user]);
};

export default useSyncUser;
