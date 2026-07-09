import {createContext, type ReactNode, useContext, useState} from "react";

export interface AppUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: "student" | "instructor";
}

interface AuthContextValue {
    user: AppUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({children}: { children: ReactNode }) {
    const [user] = useState<AppUser | null>(null);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: false,
                isLoading: false,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuthContext must be used within AuthProvider");
    }

    return context;
}