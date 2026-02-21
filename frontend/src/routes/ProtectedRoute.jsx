import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import useSyncUser from "../hooks/useSyncUser";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, hasSynced } = useAuthStore();
    useSyncUser();

    if (!hasSynced) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isTeamLeaderUser = user.teamLeader || user.role === "TeamLeader";
    const allowsTeamLeader =
        allowedRoles && allowedRoles.includes("TeamLeader") && isTeamLeaderUser;
    const allowsEmployeeEquivalent =
        allowedRoles && allowedRoles.includes("Employee") && isTeamLeaderUser;
    const allowsRole = allowedRoles && allowedRoles.includes(user.role);

    if (allowedRoles && !allowsRole && !allowsTeamLeader && !allowsEmployeeEquivalent) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
