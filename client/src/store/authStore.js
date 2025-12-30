import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Set user data
            setUser: (user) => set({ user, isAuthenticated: !!user }),

            // Set token
            setToken: (token) => {
                set({ token });
                if (token) {
                    localStorage.setItem('token', token);
                } else {
                    localStorage.removeItem('token');
                }
            },

            // Register
            register: async (name, username, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/register', {
                        name,
                        username,
                        password
                    });

                    const { user, token } = response.data.data;
                    set({ user, token, isAuthenticated: true, isLoading: false });
                    localStorage.setItem('token', token);
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            // Login
            login: async (username, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/login', {
                        username,
                        password
                    });

                    const { user, token } = response.data.data;
                    set({ user, token, isAuthenticated: true, isLoading: false });
                    localStorage.setItem('token', token);
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            // Logout
            logout: async () => {
                try {
                    await api.post('/auth/logout');
                } catch (error) {
                    console.error('Logout error:', error);
                }
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
                localStorage.removeItem('auth-storage');
            },

            // Get current user
            getMe: async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                set({ isLoading: true });
                try {
                    const response = await api.get('/auth/me');
                    set({
                        user: response.data.data.user,
                        token,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } catch (error) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false
                    });
                    localStorage.removeItem('token');
                }
            },

            // Update profile
            updateProfile: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.put('/users/profile', data);
                    set({ user: response.data.data.user, isLoading: false });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Update failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            // Update password
            updatePassword: async (currentPassword, newPassword) => {
                set({ isLoading: true, error: null });
                try {
                    await api.put('/users/password', {
                        currentPassword,
                        newPassword
                    });
                    set({ isLoading: false });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Password update failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            // Update profile picture
            updateProfilePicture: async (file) => {
                set({ isLoading: true, error: null });
                try {
                    const formData = new FormData();
                    formData.append('profilePicture', file);

                    const response = await api.put('/users/profile-picture', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });

                    const user = get().user;
                    set({
                        user: { ...user, profilePicture: response.data.data.profilePicture },
                        isLoading: false
                    });
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Upload failed';
                    set({ error: message, isLoading: false });
                    return { success: false, message };
                }
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);

export default useAuthStore;
