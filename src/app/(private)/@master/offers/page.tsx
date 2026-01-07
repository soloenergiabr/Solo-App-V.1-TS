'use client';

import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { OffersTable } from '@/frontend/club/components/admin/offers-table';
import { withAuth } from '@/frontend/auth/contexts/auth-context';

function OffersPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Ofertas"
                    subtitle="Gerencie as ofertas do clube solo"
                />
            }
        >
            <OffersTable />
        </PageLayout>
    );
}

export default withAuth(OffersPage, ['master']);
