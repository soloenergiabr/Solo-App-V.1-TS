'use client';

import { PageLayout } from '@/components/ui/page-layout';
import { ClientsTable } from '@/frontend/admin/components/clients-table';
import { withAuth } from '@/frontend/auth/contexts/auth-context';

function ClientsPage() {
    return (
        <PageLayout>
            <ClientsTable />
        </PageLayout>
    );
}

export default withAuth(ClientsPage, ['master']);