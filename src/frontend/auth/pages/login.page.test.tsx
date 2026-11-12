// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const login = vi.fn();
vi.mock('@/frontend/auth/contexts/auth-context', () => ({ useAuthContext: () => ({ login }) }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { LoginPage } from './login.page';

describe('LoginPage', () => {
    it('mostra erro de email ao sair do campo e só habilita o envio com dados válidos', async () => {
        render(<LoginPage />);
        const submit = screen.getByRole('button', { name: 'Entrar' });
        expect(submit).toBeDisabled();

        await userEvent.type(screen.getByLabelText('Email'), 'abc');
        await userEvent.tab();
        expect(await screen.findByText('Email inválido')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Email'), '@x.com');
        await userEvent.type(screen.getByLabelText('Senha'), 'segredo');
        expect(screen.queryByText('Email inválido')).toBeNull();
        expect(submit).toBeEnabled();
    });
});
