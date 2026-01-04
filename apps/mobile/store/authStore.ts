import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '@/constants/Config';

// User interface
interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    plan: 'free' | 'pro' | 'enterprise';
    youtubeChannelId?: string;
    youtubeChannelName?: string;
    youtubeChannelImage?: string;
}

// Usage stats interface
interface UsageStats {
    metadataGenerations: { used: number; limit: number; remaining: number };
    ttsGenerations: { used: number; limit: number; remaining: number };
    videoUploads: { used: number; limit: number; remaining: number };
    videoUpdates: { used: number; limit: number; remaining: number };
    analyticsViews: { used: number; limit: number; remaining: number };
}

// Auth store interface
interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    accessToken: string | null;
    usage: UsageStats | null;

    // Actions
    setUser: (user: User | null) => void;
    setAccessToken: (token: string | null) => void;
    setUsage: (usage: UsageStats) => void;
    setLoading: (loading: boolean) => void;
    login: (user: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    usage: null,

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    setAccessToken: (accessToken) => set({ accessToken }),

    setUsage: (usage) => set({ usage }),

    setLoading: (isLoading) => set({ isLoading }),

    login: async (user, token) => {
        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, user.id);
            await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

            set({
                user,
                accessToken: token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error saving auth data:', error);
        }
    },

    logout: async () => {
        try {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

            set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                usage: null,
            });
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    },

    loadFromStorage: async () => {
        try {
            set({ isLoading: true });

            const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);

            if (token && userData) {
                const user = JSON.parse(userData);
                set({
                    user,
                    accessToken: token,
                    isAuthenticated: true,
                });
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
