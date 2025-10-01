import { useCallback, useEffect, useState } from "react";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";

export function useGenerationAnalytics() {
    const api = useAuthenticatedApi();
    const [generationAnalytics, setGenerationAnalytics] = useState<any>(null);


    const fetchGenerationAnalytics = useCallback(async () => {
        if (!api.isAuthenticated) return;

        try {
            const response = await api.get('/generation/analytics');
            setGenerationAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching generation:', error);
        }
    }, []);

    useEffect(() => {
        if (api.isAuthenticated) {
            fetchGenerationAnalytics();
        }
    }, [api.isAuthenticated, fetchGenerationAnalytics]);

    return {
        generationAnalytics,
        fetchGenerationAnalytics,
    };
}