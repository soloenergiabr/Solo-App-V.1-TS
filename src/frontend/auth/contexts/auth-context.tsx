'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, AuthState, LoginCredentials, RegisterData } from '@/frontend/auth/hooks/useAuth';

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
    register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; message?: string }>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}


export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

// HOC para proteger rotas
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function AuthenticatedComponent(props: P) {
        const { isAuthenticated, isLoading } = useAuthContext();

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Acesso Negado
                        </h1>
                        <p className="text-gray-600 mb-4">
                            Você precisa estar logado para acessar esta página.
                        </p>
                        <a
                            href="/login"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Fazer Login
                        </a>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}

// Hook para verificar permissões
export function usePermissions() {
    const { user } = useAuthContext();

    const hasPermission = (permission: string): boolean => {
        return user?.permissions.includes(permission) || false;
    };

    const hasRole = (role: string): boolean => {
        return user?.roles.includes(role) || false;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        return roles.some(role => hasRole(role));
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        return permissions.some(permission => hasPermission(permission));
    };

    return {
        hasPermission,
        hasRole,
        hasAnyRole,
        hasAnyPermission,
        permissions: user?.permissions || [],
        roles: user?.roles || [],
    };
}
