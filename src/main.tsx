import {StrictMode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {createRoot} from "react-dom/client";
import "./index.css";
import {AppRoutes} from "./routes/AppRoutes";
import {AuthProvider} from "./feature/auth/context/AuthContext";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppRoutes/>
            </AuthProvider>
        </QueryClientProvider>
    </StrictMode>
);