import { PrismaClient } from '../src/app/generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Cliente de Teste
    const clientEmail = 'cliente@teste.com';
    const existingClient = await prisma.user.findUnique({
        where: { email: clientEmail },
    });

    if (existingClient) {
        console.log('⚠️  Usuário cliente já existe:', clientEmail);
    } else {
        // Hash da senha para o cliente (usando a mesma senha padrão)
        const clientPasswordHash = await bcrypt.hash('Admin@123456', 10);

        // 1. Criar a empresa/cliente
        const newClient = await prisma.client.create({
            data: {
                name: 'Cliente Teste LTDA',
                email: clientEmail,
                cpfCnpj: '99.999.999/0001-99', // CNPJ Fictício para não dar conflito
                indicationCode: 'CLIENTE-TESTE-CODE', // Código único
                status: 'client', // Status 'client' libera o acesso
                soloCoinBalance: 100,
            }
        });

        // 2. Criar o usuário vinculado
        const newClientUser = await prisma.user.create({
            data: {
                email: clientEmail,
                name: 'Usuário Cliente',
                password: clientPasswordHash,
                roles: ['user'],
                permissions: [
                    'read_inverters',
                    'read_generation_data',
                    'read_dashboard'
                ],
                clientId: newClient.id, // Vínculo com o cliente criado acima
                isActive: true, // Conta já nasce ativa
            },
        });

        console.log('✅ Usuário cliente criado com sucesso!');
        console.log('📧 Email:', clientEmail);
        console.log('🔑 Senha: Admin@123456');
        console.log('👤 ID:', newClientUser.id);
        console.log('');
    }
    //

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
