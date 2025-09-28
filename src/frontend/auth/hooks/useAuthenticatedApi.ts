'use client';

import { useAuthContext } from '../contexts/auth-context';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

export function useAuthenticatedApi() {
    const { axiosInstance, isAuthenticated } = useAuthContext();

    const get = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        return axiosInstance.get<T>(url, config);
    };

    const post = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        return axiosInstance.post<T>(url, data, config);
    };

    const put = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        return axiosInstance.put<T>(url, data, config);
    };

    const patch = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        return axiosInstance.patch<T>(url, data, config);
    };

    const del = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
        if (!isAuthenticated) {
            throw new Error('User not authenticated');
        }
        return axiosInstance.delete<T>(url, config);
    };

    return {
        get,
        post,
        put,
        patch,
        delete: del,
        axiosInstance,
        isAuthenticated,
    };
}
