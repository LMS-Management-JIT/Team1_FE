import {createContext, type ReactNode, useContext, useEffect, useState,} from "react";
import {onAuthStateChanged, type User as FirebaseUser} from "firebase/auth";
import {doc, getDoc} from "firebase/firestore";
import {auth, db} from "../../../services/firebase";

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

async function toAppUser(firebaseUser: FirebaseUser): Promise<AppUser> {
    const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    const data = snapshot.data();

    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: data?.displayName ?? firebaseUser.displayName,
        role: (data?.role as AppUser["role"]) ?? "student",
    };
}

export function AuthProvider({children}: { children: ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            try {
                setUser(await toAppUser(firebaseUser));
            } catch {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{user, isAuthenticated: Boolean(user), isLoading}}>
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