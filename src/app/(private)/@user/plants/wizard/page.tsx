'use client';

import { withAuth } from '@/frontend/auth/contexts/auth-context';
import { PlantWizardScreen } from '@/frontend/plants/wizard/plant-wizard-screen';

function WizardPage() {
    return <PlantWizardScreen />;
}

export default withAuth(WizardPage);
