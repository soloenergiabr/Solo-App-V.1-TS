import { ClientModel } from "../../auth/models/client.model"

export interface ClientRepository {
    create(client: ClientModel): Promise<void>
    findById(id: string): Promise<ClientModel | null>
    findByEmail(email: string): Promise<ClientModel | null>
    findByIndicationCode(indicationCode: string): Promise<ClientModel | null>
    update(client: ClientModel): Promise<void>
    findAll(): Promise<ClientModel[]>
}
