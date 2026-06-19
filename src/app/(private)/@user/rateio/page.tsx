"use client"

import { RateioScreen } from "@/frontend/rateio/rateio-screen";
import { useAuth } from "@/frontend/auth/hooks/useAuth";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Loader2 } from "lucide-react";

export default function RateioPage() {
    const { user } = useAuth();

    if (!user || !user.clientId) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Rateio de Creditos"
                        subtitle="Acompanhe a distribuicao dos creditos de energia"
                    />
                }
            >
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </PageLayout>
        );
    }

    return <RateioScreen />;
}
