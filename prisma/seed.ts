import { PrismaClient } from '../src/app/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário master
    const masterEmail = 'admin@solo-energia.com';
    const masterPassword = 'Admin@123456'; // Senha padrão - MUDE EM PRODUÇÃO!

    // Verificar se o usuário master já existe
    const existingMaster = await prisma.user.findUnique({
        where: { email: masterEmail },
    });

    if (existingMaster) {
        console.log('⚠️  Usuário master já existe:', masterEmail);
        console.log('   ID:', existingMaster.id);
        return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(masterPassword, 10);

    // Criar usuário master com todas as permissões
    const masterUser = await prisma.user.create({
        data: {
            email: masterEmail,
            name: 'Administrador Master',
            password: hashedPassword,
            roles: ['master'],
            permissions: [
                // Auth permissions
                'read_users',
                'create_user',
                'update_user',
                'delete_user',
                'manage_roles',
                'manage_permissions',

                // Inverter permissions
                'read_inverters',
                'create_inverter',
                'update_inverter',
                'delete_inverter',

                // Generation data permissions
                'read_generation_data',
                'create_generation_unit',
                'update_generation_unit',
                'delete_generation_unit',
                'sync_generation_data',

                // Client permissions
                'read_clients',
                'create_client',
                'update_client',
                'delete_client',

                // Analytics permissions
                'read_analytics',
                'read_dashboard',

                // System permissions
                'manage_system',
                'view_logs',
                'manage_settings',
            ],
            isActive: true,
        },
    });

    console.log('✅ Usuário master criado com sucesso!');
    console.log('');
    console.log('📧 Email:', masterEmail);
    console.log('🔑 Senha:', masterPassword);
    console.log('👤 ID:', masterUser.id);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('');

    console.log('🎉 Seed concluído com sucesso!');
}

main()
    .catch((e) => {
        console.error('❌ Erro ao executar seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
