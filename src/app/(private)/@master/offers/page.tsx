'use client';

import { PageLayout } from '@/components/ui/page-layout';
import { OffersTable } from '@/frontend/club/components/admin/offers-table';
import { withAuth } from '@/frontend/auth/contexts/auth-context';

function OffersPage() {
    return (
        <PageLayout>
            <OffersTable />
        </PageLayout>
    );
}

export default withAuth(OffersPage, ['master']);
