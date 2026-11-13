import { z } from 'zod';

/** Permissões do usuário master (mesmas strings de `prisma/seed.ts`), agrupadas para a tela de equipe. */
export const PERMISSION_GROUPS = [
    {
        label: 'Usuários e acesso',
        permissions: [
            { key: 'read_users', label: 'Ver usuários' },
            { key: 'create_user', label: 'Criar usuários' },
            { key: 'update_user', label: 'Editar usuários' },
            { key: 'delete_user', label: 'Excluir usuários' },
            { key: 'manage_roles', label: 'Gerenciar equipe administrativa' },
            { key: 'manage_permissions', label: 'Gerenciar permissões' },
        ],
    },
    {
        label: 'Clientes',
        permissions: [
            { key: 'read_clients', label: 'Ver clientes' },
            { key: 'create_client', label: 'Cadastrar clientes' },
            { key: 'update_client', label: 'Editar clientes' },
            { key: 'delete_client', label: 'Excluir clientes' },
        ],
    },
    {
        label: 'Inversores e geração',
        permissions: [
            { key: 'read_inverters', label: 'Ver inversores' },
            { key: 'create_inverter', label: 'Cadastrar inversores' },
            { key: 'update_inverter', label: 'Editar inversores' },
            { key: 'delete_inverter', label: 'Excluir inversores' },
            { key: 'read_generation_data', label: 'Ver dados de geração' },
            { key: 'create_generation_unit', label: 'Cadastrar unidades geradoras' },
            { key: 'update_generation_unit', label: 'Editar unidades geradoras' },
            { key: 'delete_generation_unit', label: 'Excluir unidades geradoras' },
            { key: 'sync_generation_data', label: 'Sincronizar geração' },
        ],
    },
    {
        label: 'Analytics',
        permissions: [
            { key: 'read_analytics', label: 'Ver relatórios' },
            { key: 'read_dashboard', label: 'Ver painel' },
        ],
    },
    {
        label: 'Sistema',
        permissions: [
            { key: 'manage_system', label: 'Administrar o sistema' },
            { key: 'view_logs', label: 'Ver logs' },
            { key: 'manage_settings', label: 'Alterar configurações' },
        ],
    },
] as const;

export type Permission = (typeof PERMISSION_GROUPS)[number]['permissions'][number]['key'];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key)) as Permission[];

const readOnly = ALL_PERMISSIONS.filter((p) => p.startsWith('read_'));

export const PERMISSION_PRESETS: { label: string; permissions: Permission[] }[] = [
    { label: 'Administrador completo', permissions: ALL_PERMISSIONS },
    {
        label: 'Operação',
        permissions: [
            ...readOnly,
            'create_client', 'update_client',
            'create_inverter', 'update_inverter',
            'create_generation_unit', 'update_generation_unit', 'sync_generation_data',
        ],
    },
    { label: 'Somente leitura', permissions: readOnly },
];

/** Quem pode gerir a equipe; garantimos que sempre reste ao menos um master ativo assim. */
export const MANAGE_PERMISSIONS: Permission[] = ['manage_roles', 'manage_permissions'];

export function isFullAdmin(user: { isActive: boolean; permissions: string[] }): boolean {
    return user.isActive && MANAGE_PERMISSIONS.every((p) => user.permissions.includes(p));
}

/** Regras de senha usadas em reset-password, change-password e criação de admin. */
export const passwordSchema = z.string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número');
