import { IndicationRepository } from "../repositories/indication.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { IndicationStatus } from "../models/indication.model";
import { TransactionModel, TransactionType } from "../models/transaction.model";

export interface ProcessJestorWebhookRequest {
    jestorId: string;
    internalId?: string;
    status: string;
    projectValue?: number;
    email?: string;
    cpf?: string;
}

export class ProcessJestorWebhookUseCase {
    constructor(
        private indicationRepository: IndicationRepository,
        private transactionRepository: TransactionRepository
    ) { }

    async execute(request: ProcessJestorWebhookRequest): Promise<void> {
        let indication = await this.indicationRepository.findByJestorId(request.jestorId);

        // If not found by Jestor ID, try finding by Internal ID (first sync)
        if (!indication && request.internalId) {
            console.log(`Indication not found by Jestor ID ${request.jestorId}. Trying Internal ID: ${request.internalId}`);
            indication = await this.indicationRepository.findById(request.internalId);

            if (indication) {
                console.log(`Indication found by Internal ID. Linking Jestor ID: ${request.jestorId}`);
                indication.jestorId = request.jestorId; // Link the IDs
            }
        }

        if (!indication) {
            throw new Error(`Indication not found for Jestor ID: ${request.jestorId} or Internal ID: ${request.internalId}`);
        }

        const newStatus = this.mapStatus(request.status);
        const oldStatus = indication.status;

        indication.status = newStatus;
        if (request.projectValue) indication.projectValue = request.projectValue;
        // Ensure jestorId is set if it wasn't already (redundant but safe)
        if (!indication.jestorId) indication.jestorId = request.jestorId;

        await this.indicationRepository.update(indication);

        if (newStatus === IndicationStatus.approved && oldStatus !== IndicationStatus.approved) {
            if (!indication.projectValue) {
                console.warn(`Indication ${indication.id} approved but no project value.`);
                return;
            }

            const rewardAmount = indication.projectValue * 0.05;

            const transaction = new TransactionModel({
                clientId: indication.referrerId,
                type: TransactionType.indication_reward,
                amount: rewardAmount,
                description: `Comissão por indicação (Projeto: ${indication.projectValue})`,
                indicationId: indication.id
            });

            await this.transactionRepository.create(transaction);
        }
    }

    private mapStatus(jestorStatus: string): IndicationStatus {
        const status = jestorStatus.toLowerCase();
        if (status === 'ganho' || status === 'fechado' || status === 'won') return IndicationStatus.approved;
        if (status === 'perdido' || status === 'lost') return IndicationStatus.rejected;
        return IndicationStatus.pending;
    }
}