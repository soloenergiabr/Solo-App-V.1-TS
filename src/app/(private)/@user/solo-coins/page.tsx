import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { SoloCoinsDashboard } from "@/frontend/club/components";

export default function SoloCoinsPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Solo Coins"
                    subtitle="Gerencie seu saldo, indicações e transações"
                />
            }
        >
            <SoloCoinsDashboard />
        </PageLayout>
    );
}
