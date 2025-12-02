import { Suspense } from 'react';
import { ResetPasswordPage } from "@/frontend/auth/pages/reset-password.page";

export default function ResetPassword() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Carregando...</div>}>
            <ResetPasswordPage />
        </Suspense>
    );
}
