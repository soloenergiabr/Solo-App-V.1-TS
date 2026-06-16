import type { ReactNode } from "react";
import { BrandLogo } from "@/frontend/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-2">
            {/* Brand panel (desktop) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-card p-12 lg:flex">
                <div className="absolute inset-0 bg-brand-gradient opacity-10" />
                <div className="relative z-10">
                    <BrandLogo height={32} />
                </div>
                <div className="relative z-10 space-y-3">
                    <h1 className="font-display text-4xl font-bold leading-tight text-foreground">
                        Você no controle
                        <span className="text-brand-gradient"> da sua energia</span>
                    </h1>
                    <p className="max-w-sm text-sm text-muted-foreground">
                        Acompanhe sua geração, economia e o retorno do seu investimento
                        em energia solar — em tempo real.
                    </p>
                </div>
                <div className="relative z-10 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Solo Energia
                </div>
            </div>

            {/* Form area */}
            <div className="flex min-h-screen items-center justify-center p-6 lg:min-h-0">
                <div className="w-full max-w-sm space-y-8">
                    <div className="flex justify-center lg:hidden">
                        <BrandLogo height={28} />
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
