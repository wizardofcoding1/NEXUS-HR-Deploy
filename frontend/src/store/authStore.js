import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: null,
    hasSynced: false,

    login: (user) => {
        set({ user, hasSynced: true });
    },

    setUser: (user) => {
        set((state) => ({ ...state, user }));
    },

    setHasSynced: (hasSynced) => {
        set((state) => ({ ...state, hasSynced }));
    },

    logout: () => {
        set({ user: null, hasSynced: true });
    },
}));
