import { PageLayout, PageHeader } from "@/components/ui/page-layout";
import { ClubDashboard } from "@/frontend/club/components";

export default function ClubPage() {
    return (
        <PageLayout
            header={
                <PageHeader
                    title="Clube Solo"
                    subtitle="Indique amigos, ganhe Solo Coins e troque por prêmios exclusivos"
                />
            }
        >
            <ClubDashboard />
        </PageLayout>
    );
}