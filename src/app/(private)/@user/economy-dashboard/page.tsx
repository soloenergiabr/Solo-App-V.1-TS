"use client"

import { ConsumptionDashboard } from "@/frontend/consumption/components/consumption-dashboard";
import { useAuth } from "@/frontend/auth/hooks/useAuth";

export default function EconomyDashboardPage() {
    const { user } = useAuth();

    if (!user || !user.clientId) {
        return <div className="p-8">Carregando usuário...</div>;
    }

    return <ConsumptionDashboard clientId={user.clientId} />;
}
