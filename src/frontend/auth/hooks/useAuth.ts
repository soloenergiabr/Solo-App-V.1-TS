'use client';

import { useState, useEffect, useCallback } from 'react';

export interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
    permissions: string[];
    clientId?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    clientId?: string;
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    // Verificar se há token armazenado e validar
    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAuthState({
                    user: data.data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                // Token inválido, remover do storage
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setAuthState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: 'Authentication check failed',
            });
        }
    }, []);

    // Login
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                // Armazenar tokens
                localStorage.setItem('accessToken', data.data.accessToken);
                localStorage.setItem('refreshToken', data.data.refreshToken);

                setAuthState({
                    user: data.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                return { success: true };
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: data.message || 'Login failed',
                }));
                return { success: false, error: data.message };
            }
        } catch (error) {
            const errorMessage = 'Network error during login';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Register
    const register = useCallback(async (userData: RegisterData) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
                return { success: true, message: data.message };
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: data.message || 'Registration failed',
                }));
                return { success: false, error: data.message };
            }
        } catch (error) {
            const errorMessage = 'Network error during registration';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    // Logout
    const logout = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    }, []);

    // Refresh token
    const refreshToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                logout();
                return false;
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.data.accessToken);
                return true;
            } else {
                logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    }, [logout]);

    // Verificar autenticação na inicialização
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Configurar interceptador para refresh automático de token
    useEffect(() => {
        if (!authState.isAuthenticated) return;

        const interceptor = async (response: Response) => {
            if (response.status === 401) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry the original request
                    return fetch(response.url, {
                        ...response,
                        headers: {
                            ...response.headers,
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    });
                }
            }
            return response;
        };

        // Note: This is a simplified interceptor concept
        // In a real app, you'd use axios interceptors or a similar mechanism
    }, [authState.isAuthenticated, refreshToken]);

    return {
        ...authState,
        login,
        register,
        logout,
        refreshToken,
        checkAuth,
    };
}
