import { useQuery } from "@tanstack/react-query";
import { useAuthenticatedApi } from "@/frontend/auth/hooks/useAuthenticatedApi";

export function useGenerationAnalytics() {
    const api = useAuthenticatedApi();

    const {
        data: generationAnalytics,
        isLoading,
        error,
        refetch: fetchGenerationAnalytics,
    } = useQuery({
        queryKey: ['generation-analytics'],
        queryFn: async () => {
            const response = await api.get('/generation/analytics');
            return response.data;
        },
        enabled: api.isAuthenticated,
        staleTime: 1000 * 60, // 1 minute
    });

    return {
        generationAnalytics: generationAnalytics ?? null,
        isLoading,
        error,
        fetchGenerationAnalytics,
    };
}