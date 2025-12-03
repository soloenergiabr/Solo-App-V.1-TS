import { UserRepository } from '@/backend/auth/repositories/user.repository';
import { User } from '@/backend/auth/models/user.model';
import { ClientRepository } from '@/backend/club/repositories/client.repository';
import { ClientModel } from '@/backend/club/models/client.model';

export class AdminService {
    constructor(private userRepository: UserRepository, private clientsRepository: ClientRepository) { }

    async listClients(): Promise<ClientModel[]> {
        const clients = await this.clientsRepository.findAll();
        return clients;
    }

    async getClientById(id: string): Promise<ClientModel | null> {
        return await this.clientsRepository.findById(id);
    }

    async createClient(data: Partial<ClientModel>): Promise<ClientModel> {
        // Basic validation
        if (!data.name || !data.email || !data.cpfCnpj) {
            throw new Error('Name, Email and CPF/CNPJ are required');
        }

        // Check if email already exists
        const existingEmail = await this.clientsRepository.findByEmail(data.email);
        if (existingEmail) {
            throw new Error('Client with this email already exists');
        }

        // Check if CPF/CNPJ already exists (we need to implement findByCpfCnpj in repository or check manually if not available)
        // For now, let's assume the repository will throw or we add the method.
        // PrismaClientRepository has findByEmail, findById. It does NOT have findByCpfCnpj exposed in interface yet.
        // But PrismaClientRepository implementation HAS findByCpfCnpj logic inside create? No, it checks unique constraint.
        // Let's rely on repository error or add the method.
        // Actually, let's check if we can add findByCpfCnpj to interface.

        // Generate indication code
        const indicationCode = Math.random().toString(36).substring(2, 15);

        const newClient = new ClientModel({
            name: data.name,
            email: data.email,
            cpfCnpj: data.cpfCnpj,
            phone: data.phone,
            address: data.address,
            indicationCode,
            status: data.status || 'client',
        });

        await this.clientsRepository.create(newClient);
        return newClient;
    }

    async updateClient(client: ClientModel): Promise<void> {
        return await this.clientsRepository.update(client);
    }

    async deleteClient(id: string): Promise<void> {
        return await this.clientsRepository.delete(id);
    }

    async hardDeleteClient(id: string): Promise<void> {
        return await this.clientsRepository.hardDelete(id);
    }
}
