import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------- User Auth (website customers via Supabase Auth) ----------
interface UserAuthState {
    user: {
        id: string;
        email: string;
        full_name?: string;
    } | null;
    isAuthenticated: boolean;
    setUser: (user: UserAuthState['user']) => void;
    clearUser: () => void;
}

export const useUserAuthStore = create<UserAuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            clearUser: () => set({ user: null, isAuthenticated: false }),
        }),
        { name: 'advay-user-auth' }
    )
);

// ---------- Admin Auth (hardcoded admin credentials) ----------
interface AdminAuthState {
    isAdminAuthenticated: boolean;
    adminEmail: string | null;
    setAdminAuth: (email: string) => void;
    clearAdminAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
    persist(
        (set) => ({
            isAdminAuthenticated: false,
            adminEmail: null,
            setAdminAuth: (email: string) =>
                set({ isAdminAuthenticated: true, adminEmail: email }),
            clearAdminAuth: () =>
                set({ isAdminAuthenticated: false, adminEmail: null }),
        }),
        { name: 'advay-admin-auth' }
    )
);
