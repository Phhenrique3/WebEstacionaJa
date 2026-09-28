import { Navigate, Outlet } from "react-router-dom";

export function ProtectedRoute() {
    const token = localStorage.getItem("@EstacioneJa:token");

    if (!token) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    message: "Você precisa entrar para acessar o sistema.",
                }}
            />
        );
    }

    return <Outlet />;
}