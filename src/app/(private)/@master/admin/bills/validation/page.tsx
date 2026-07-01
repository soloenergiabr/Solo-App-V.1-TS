'use client';

import { BillValidationQueue } from '@/frontend/admin/components/bill-validation-queue';
import { PageHeader, PageLayout } from '@/components/ui/page-layout';
import { withAuth } from '@/frontend/auth/contexts/auth-context';

function BillsValidationPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Validacao de Faturas"
                    subtitle="Confira e aprove as faturas enviadas pelos clientes."
                />
            }
        >
            <BillValidationQueue />
        </PageLayout>
    );
}

export default withAuth(BillsValidationPage, ['master']);
