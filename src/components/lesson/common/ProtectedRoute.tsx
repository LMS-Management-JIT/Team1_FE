import type {ReactNode} from "react";
import {Navigate} from "react-router-dom";
import {useAuthContext} from "../../../feature/auth/context/AuthContext";
import {ROUTES} from "../../../constants/routes";
import {Loading} from "../ui/Loading";

export function ProtectedRoute({children}: { children: ReactNode }) {
    const {isAuthenticated, isLoading} = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loading/>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.DASHBOARD} replace/>;
    }

    return <>{children}</>;
}