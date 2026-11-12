import { IndicationRepository } from "../repositories/indication.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { IndicationModel, IndicationStatus } from "../models/indication.model";
import { TransactionModel, TransactionType } from "../models/transaction.model";
import { calculateReferralReward, DEFAULT_REFERRAL_REWARD_PERCENT } from "../club-settings";

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
        private transactionRepository: TransactionRepository,
        private getRewardPercent: () => Promise<number> = async () => DEFAULT_REFERRAL_REWARD_PERCENT
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

        // Ensure jestorId is set if it wasn't already (redundant but safe)
        if (!indication.jestorId) indication.jestorId = request.jestorId;

        await this.applyStatus(indication, this.mapStatus(request.status), request.projectValue);
    }

    /** Muda o status e, na conversão, credita a comissão ao indicador (uma única vez). Usado também pelo admin. */
    async applyStatus(indication: IndicationModel, newStatus: IndicationStatus, projectValue?: number): Promise<void> {
        indication.status = newStatus;
        if (projectValue) indication.projectValue = projectValue;

        await this.indicationRepository.update(indication);

        if (newStatus !== IndicationStatus.approved) return;

        if (!indication.projectValue) {
            console.warn(`Indication ${indication.id} approved but no project value.`);
            return;
        }

        // Idempotente: reaprovar (webhook repetido ou admin) não paga de novo.
        if (await this.transactionRepository.hasIndicationReward(indication.id)) return;

        const percent = await this.getRewardPercent();
        const transaction = new TransactionModel({
            clientId: indication.referrerId,
            type: TransactionType.indication_reward,
            amount: calculateReferralReward(indication.projectValue, percent),
            description: `Comissão por indicação (${percent}% do projeto de R$ ${indication.projectValue.toLocaleString("pt-BR")})`,
            indicationId: indication.id
        });

        await this.transactionRepository.create(transaction);
    }

    private mapStatus(jestorStatus: string): IndicationStatus {
        const status = jestorStatus.toLowerCase();
        if (status === 'ganho' || status === 'fechado' || status === 'won') return IndicationStatus.approved;
        if (status === 'perdido' || status === 'lost') return IndicationStatus.rejected;
        return IndicationStatus.pending;
    }
}
