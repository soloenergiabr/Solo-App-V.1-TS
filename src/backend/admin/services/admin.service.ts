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

    async updateClient(client: ClientModel): Promise<void> {
        return await this.clientsRepository.update(client);
    }

    async deleteClient(id: string): Promise<void> {
        return await this.clientsRepository.delete(id);
    }
}
