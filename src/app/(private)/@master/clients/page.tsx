'use client';

import { PageLayout } from '@/components/ui/page-layout';
import { ClientsTable } from '@/frontend/admin/components/clients-table';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function ClientsPage() {
    return (
        <PageLayout
            header={
                <div className='flex flex-row w-full justify-between items-center'>

                    <h1 className="text-2xl font-bold">Clientes</h1>
                    <Client
                </div>
            }

        >
            <ClientsTable />
        </PageLayout>
    );
}

export default withAuth(ClientsPage, ['master']);