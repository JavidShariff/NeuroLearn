import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { DashboardSkeleton } from "@/components/ui/LoadingSkeleton";

const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();
    console.log("ProtectedRoute - user:", user, "isLoading:", isLoading);
    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
