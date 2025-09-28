"use client";

import { LoadingPage } from "@/components/ui/loading";
import { AppLayout } from "@/frontend/app-layout";
import { usePermissions } from "@/frontend/auth/contexts/auth-context";

export default function PrivateLayout({ master, user, children }: { master: React.ReactNode, user: React.ReactNode, children: React.ReactNode }) {
    const { hasRole, isLoading } = usePermissions();

    if (isLoading) {
        return <LoadingPage />
    }

    if (hasRole('master') && master) {
        return <AppLayout>{master}</AppLayout>;
    }

    if (hasRole('user') && user) {
        return <AppLayout>{user}</AppLayout>;
    }

    return children;
}