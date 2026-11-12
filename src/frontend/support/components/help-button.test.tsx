// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const state = vi.hoisted(() => ({ roles: ['user'], pathname: '/controle' }));
vi.mock('@/frontend/auth/contexts/auth-context', () => ({
    usePermissions: () => ({ hasRole: (r: string) => state.roles.includes(r) }),
}));
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }));

import { HelpButton } from './help-button';

describe('HelpButton', () => {
    beforeEach(() => {
        state.roles = ['user'];
        state.pathname = '/controle';
        vi.stubEnv('NEXT_PUBLIC_SUPPORT_WHATSAPP', '5585999999999');
    });
    afterEach(() => vi.unstubAllEnvs());

    it('abre o menu com WhatsApp, FAQ e chat para o cliente', async () => {
        render(<HelpButton />);
        await userEvent.click(screen.getByRole('button', { name: 'Ajuda' }));
        expect(screen.getByRole('menuitem', { name: /WhatsApp/ })).toHaveAttribute(
            'href',
            expect.stringContaining('https://wa.me/5585999999999?text='),
        );
        expect(screen.getByRole('menuitem', { name: /Perguntas frequentes/ })).toHaveAttribute('href', '/support?tab=faq');
        expect(screen.getByRole('menuitem', { name: /Chat com IA/ })).toHaveAttribute('href', '/support');
    });

    it('esconde o WhatsApp sem número configurado', async () => {
        vi.stubEnv('NEXT_PUBLIC_SUPPORT_WHATSAPP', '');
        render(<HelpButton />);
        await userEvent.click(screen.getByRole('button', { name: 'Ajuda' }));
        expect(screen.queryByRole('menuitem', { name: /WhatsApp/ })).toBeNull();
    });

    it('não aparece para o admin nem na análise da conta', () => {
        state.roles = ['master'];
        const { unmount } = render(<HelpButton />);
        expect(screen.queryByRole('button', { name: 'Ajuda' })).toBeNull();
        unmount();
        state.roles = ['user'];
        state.pathname = '/economia/abc123';
        render(<HelpButton />);
        expect(screen.queryByRole('button', { name: 'Ajuda' })).toBeNull();
    });
});
