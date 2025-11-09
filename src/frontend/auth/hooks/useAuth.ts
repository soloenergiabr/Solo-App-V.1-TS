'use client';

import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';

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
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    address?: string;
    avgEnergyCost?: number;
    enelInvoiceFile?: string;
    indicationCode?: string;
}

// Criar instância do axios
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: '/api',
        timeout: 10000,
    });

    return instance;
};

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const [axiosInstance] = useState<AxiosInstance>(() => createAxiosInstance());

    // Logout function (precisa ser definido antes dos interceptadores)
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

    // Refresh token function
    const refreshToken = useCallback(async (): Promise<boolean> => {
        try {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            if (!refreshTokenValue) {
                logout();
                return false;
            }

            const response = await axios.post('/api/auth/refresh', {
                refreshToken: refreshTokenValue,
            });

            if (response.data.success) {
                const newAccessToken = response.data.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                // Atualizar header Authorization para próximas requisições
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

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
    }, [logout, axiosInstance]);

    // Configurar interceptadores do axios
    useEffect(() => {
        // Request interceptor - adicionar token automaticamente
        const requestInterceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - lidar com refresh token automaticamente
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshed = await refreshToken();
                    if (refreshed) {
                        // Retry the original request with new token
                        const newToken = localStorage.getItem('accessToken');
                        if (newToken && originalRequest) {
                            originalRequest.headers.Authorization = `Bearer ${newToken}`;
                            return axiosInstance(originalRequest);
                        }
                    }
                }

                return Promise.reject(error);
            }
        );

        // Cleanup interceptors on unmount
        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [axiosInstance, refreshToken]);

    // Verificar se há token armazenado e validar
    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setAuthState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            const response = await axiosInstance.get('/auth/me');

            if (response.data.success) {
                setAuthState({
                    user: response.data.data,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });
            } else {
                logout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    }, [axiosInstance, logout]);

    // Login
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await axiosInstance.post('/auth/login', credentials);

            if (response.data.success) {
                // Armazenar tokens
                localStorage.setItem('accessToken', response.data.data.accessToken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);

                // Atualizar header Authorization
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.accessToken}`;

                setAuthState({
                    user: response.data.data.user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                });

                return { success: true };
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Login failed',
                }));
                return { success: false, error: response.data.message };
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Network error during login';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, [axiosInstance]);

    // Register
    const register = useCallback(async (userData: RegisterData) => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await axiosInstance.post('/auth/register', userData);

            if (response.data.success) {
                setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
                return { success: true, message: response.data.message };
            } else {
                setAuthState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: response.data.message || 'Registration failed',
                }));
                return { success: false, error: response.data.message };
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Network error during registration';
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, [axiosInstance]);

    // Verificar autenticação na inicialização
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return {
        ...authState,
        login,
        register,
        logout,
        refreshToken,
        checkAuth,
        axiosInstance, // Exportar instância do axios para uso em outros hooks/componentes
    };
}
