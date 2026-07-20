import { createContext, type ReactNode, useContext } from "react";
import { useAuth } from "../../../services/authService.ts";

export interface AppUser {
    uid: string;
    studentId: string | null;
    email: string | null;
    displayName: string | null;
    role: string | null;
}

interface AuthContextValue {
    user: AppUser | null;
    studentId: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // 💡 Lấy cả user và studentId đã được chuẩn hóa từ hook useAuth
    const { user, studentId, isAuthenticated, isLoading } = useAuth();

    const mappedUser: AppUser | null = user ? {
        uid: user.id,
        studentId: studentId, // 🎯 THÊM: Đồng bộ mã học viên vào đối tượng user mapped
        email: user.email,
        displayName: user.username || user.email?.split('@')[0] || "Học viên",
        role: user.role || null,
    } : null;

    return (
        <AuthContext.Provider
            value={{
                user: mappedUser,
                studentId: studentId,
                isAuthenticated,
                isLoading,
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