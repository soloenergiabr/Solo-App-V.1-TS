'use client';

import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { FaturapiOverviewScreen } from '@/frontend/admin/components/faturapi/faturapi-overview';

function FaturapiPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Faturapi"
                    subtitle="Busca automatica das faturas de energia: saldo, unidades monitoradas, conexoes e webhooks"
                />
            }
        >
            <FaturapiOverviewScreen />
        </PageLayout>
    );
}

export default withAuth(FaturapiPage, ['master']);
