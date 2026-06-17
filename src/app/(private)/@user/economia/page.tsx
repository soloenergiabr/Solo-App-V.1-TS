"use client"

import { EconomiaScreen } from "@/frontend/economia/economia-screen";
import { useAuth } from "@/frontend/auth/hooks/useAuth";
import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { Loader2 } from "lucide-react";

export default function EconomiaPage() {
    const { user } = useAuth();

    if (!user || !user.clientId) {
        return (
            <PageLayout
                header={
                    <PageHeader
                        title="Economia"
                        subtitle="Acompanhe sua economia mensal e histórico de consumo"
                    />
                }
            >
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            </PageLayout>
        );
    }

    return <EconomiaScreen />;
}
