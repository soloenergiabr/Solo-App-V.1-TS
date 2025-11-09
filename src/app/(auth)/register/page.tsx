"use client"

import { Suspense } from 'react';
import { RegisterPage } from "@/frontend/auth/pages/register.page";

function RegisterPageWrapper() {
    return <RegisterPage />;
}

export default function Register() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterPageWrapper />
        </Suspense>
    );
}