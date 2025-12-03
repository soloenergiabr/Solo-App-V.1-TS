'use client';

import { useState } from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { FAQsTable } from '@/frontend/admin/components/faqs-table';
import { FAQDialog } from '@/frontend/admin/components/faq-dialog';

function FAQsPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleFAQCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <PageLayout
            header={
                <div className="flex flex-row w-full justify-between items-center">
                    <h1 className="text-2xl font-bold">Gerenciar FAQs</h1>
                    <FAQDialog onSuccess={handleFAQCreated} />
                </div>
            }
        >
            <FAQsTable key={refreshKey} />
        </PageLayout>
    );
}

export default withAuth(FAQsPage, ['master']);
