'use client';

import { useState } from 'react';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
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
                <PageHeader
                    title="Gerenciar FAQs"
                    actions={<FAQDialog onSuccess={handleFAQCreated} />}
                />
            }
        >
            <FAQsTable key={refreshKey} />
        </PageLayout>
    );
}

export default withAuth(FAQsPage, ['master']);
