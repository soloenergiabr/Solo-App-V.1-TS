import { ClientStatus, PrismaClient } from "@/app/generated/prisma";
import { ClientModel } from "../../../club/models/client.model";
import { ClientRepository } from "../client.repository";

export class PrismaClientRepository implements ClientRepository {
    constructor(private prisma: PrismaClient) { }

    async create(client: ClientModel): Promise<void> {
        await this.prisma.client.create({
            data: {
                id: client.id,
                name: client.name,
                email: client.email,
                cpfCnpj: client.cpfCnpj,
                phone: client.phone || null,
                address: client.address || null,
                avgEnergyCost: client.avgEnergyCost || null,
                enelInvoiceFile: client.enelInvoiceFile || null,
                indicationCode: client.indicationCode,
                status: client.status as ClientStatus,
                createdAt: client.createdAt,
                updatedAt: client.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<ClientModel | null> {
        const client = await this.prisma.client.findUnique({
            where: { id },
        });

        if (!client) return null;

        return new ClientModel({
            id: client.id,
            name: client.name,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone || undefined,
            address: client.address || undefined,
            avgEnergyCost: client.avgEnergyCost || undefined,
            enelInvoiceFile: client.enelInvoiceFile || undefined,
            indicationCode: client.indicationCode,
            status: client.status,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        });
    }

    async findByEmail(email: string): Promise<ClientModel | null> {
        const client = await this.prisma.client.findUnique({
            where: { email },
        });

        if (!client) return null;

        return new ClientModel({
            id: client.id,
            name: client.name,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone || undefined,
            address: client.address || undefined,
            avgEnergyCost: client.avgEnergyCost || undefined,
            enelInvoiceFile: client.enelInvoiceFile || undefined,
            indicationCode: client.indicationCode,
            status: client.status,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        });
    }

    async findByIndicationCode(indicationCode: string): Promise<ClientModel | null> {
        const client = await this.prisma.client.findUnique({
            where: { indicationCode },
        });

        if (!client) return null;

        return new ClientModel({
            id: client.id,
            name: client.name,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone || undefined,
            address: client.address || undefined,
            avgEnergyCost: client.avgEnergyCost || undefined,
            enelInvoiceFile: client.enelInvoiceFile || undefined,
            indicationCode: client.indicationCode,
            status: client.status,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        });
    }

    async update(client: ClientModel): Promise<void> {
        await this.prisma.client.update({
            where: { id: client.id },
            data: {
                name: client.name,
                email: client.email,
                cpfCnpj: client.cpfCnpj,
                phone: client.phone || null,
                address: client.address || null,
                avgEnergyCost: client.avgEnergyCost || null,
                enelInvoiceFile: client.enelInvoiceFile || null,
                indicationCode: client.indicationCode,
                status: client.status as ClientStatus,
                updatedAt: new Date(),
            },
        });
    }

    async findAll(): Promise<ClientModel[]> {
        const clients = await this.prisma.client.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return clients.map(client => new ClientModel({
            id: client.id,
            name: client.name,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone || undefined,
            address: client.address || undefined,
            avgEnergyCost: client.avgEnergyCost || undefined,
            enelInvoiceFile: client.enelInvoiceFile || undefined,
            indicationCode: client.indicationCode,
            status: client.status,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        }));
    }
}
