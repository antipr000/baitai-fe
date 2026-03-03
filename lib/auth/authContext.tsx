"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const PREFS_STORAGE_KEY = "preferences_set";

function readStoredPreferences(): boolean | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(PREFS_STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
    return null;
}

export function storePreferences(value: boolean) {
    localStorage.setItem(PREFS_STORAGE_KEY, String(value));
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    preferencesSet: boolean | null;
    preferencesLoading: boolean;
    setPreferencesStatus: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    preferencesSet: null,
    preferencesLoading: true,
    setPreferencesStatus: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [preferencesSet, setPreferencesSet] = useState<boolean | null>(null);
    const [preferencesLoading, setPreferencesLoading] = useState(true);

    const setPreferencesStatus = useCallback((value: boolean) => {
        storePreferences(value);
        setPreferencesSet(value);
        setPreferencesLoading(false);
    }, []);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            setPreferencesLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                const stored = readStoredPreferences();
                setPreferencesSet(stored);
                setPreferencesLoading(false);
            } else {
                setPreferencesSet(null);
                setPreferencesLoading(false);
                localStorage.removeItem(PREFS_STORAGE_KEY);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, preferencesSet, preferencesLoading, setPreferencesStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);