'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HelpCircle, MessageCircle, Bot, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/frontend/auth/contexts/auth-context';
import { SUPPORT_WHATSAPP_MESSAGE, supportWhatsAppUrl } from '@/frontend/support/support-links';

// /support já tem chat e WhatsApp; /economia/[billId] tem o botão flutuante do chat da conta no mesmo canto.
const HIDDEN_ON = /^\/(support|economia\/[^/]+)\/?$/;

export function HelpButton() {
    const { hasRole } = usePermissions();
    const pathname = usePathname();

    if (hasRole('master') || !hasRole('user') || HIDDEN_ON.test(pathname ?? '')) return null;

    const whatsapp = supportWhatsAppUrl(SUPPORT_WHATSAPP_MESSAGE);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    aria-label="Ajuda"
                    className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg md:bottom-6 md:right-6"
                >
                    <HelpCircle className="h-6 w-6" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-56">
                {whatsapp && (
                    <DropdownMenuItem asChild>
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                            <MessageCircle /> Falar no WhatsApp
                        </a>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link href="/support?tab=faq">
                        <BookOpen /> Perguntas frequentes
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/support">
                        <Bot /> Chat com IA
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
