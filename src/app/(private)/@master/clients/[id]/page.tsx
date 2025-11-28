'use client';

import { PageLayout } from '@/components/ui/page-layout';
import { ClientDetails } from '@/frontend/admin/components/client-details';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { use } from 'react';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

function ClientDetailsPage({ params }: PageProps) {
    const { id } = use(params);
    return (
        <PageLayout>
            <ClientDetails clientId={id} />
        </PageLayout>
    );
}

export default withAuth(ClientDetailsPage, ['master']);
