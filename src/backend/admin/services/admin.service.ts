import { UserRepository } from '@/backend/auth/repositories/user.repository';
import { User } from '@/backend/auth/models/user.model';
import { ClientRepository } from '@/backend/club/repositories/client.repository';
import { Client } from '@/app/generated/prisma';

export class AdminService {
    constructor(private userRepository: UserRepository, private clientsRepository: ClientRepository) { }

    async listClients(): Promise<Client[]> {
        const clients = await this.clientsRepository.findAll();
        return clients
    }
}
