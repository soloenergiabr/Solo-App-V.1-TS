'use client';

import { useState } from 'react';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { ClientsTable } from '@/frontend/admin/components/clients-table';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { CreateClientDialog } from '@/frontend/admin/components/create-client-dialog';

function ClientsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleClientCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <PageLayout
            header={
                <PageHeader
                    title="Clientes"
                    actions={<CreateClientDialog onSuccess={handleClientCreated} />}
                />
            }
        >
            <ClientsTable key={refreshKey} />
        </PageLayout>
    );
}

export default withAuth(ClientsPage, ['master']);
