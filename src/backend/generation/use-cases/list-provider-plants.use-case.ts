import { z } from "zod"
import { ADMIN_INVERTER_PROVIDERS, ProviderPlant } from "../models/provider-plant.model"
import { InverterApiFactory } from "../repositories/inverter-api.factory"
import { InverterModel } from "../models/inverter.model"

const ProviderEnum = z.enum(ADMIN_INVERTER_PROVIDERS)

const CredentialsSchema = z.object({
    account: z.string().min(1, 'Account is required').optional(),
    password: z.string().min(1, 'Password is required').optional(),
    providerUrl: z.string().url().optional()
}).optional()

const ProviderPlantLocationSchema = z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional()
}).optional()

const ProviderPlantSchema = z.object({
    id: z.string(),
    name: z.string(),
    capacityKw: z.number().optional(),
    totalEnergy: z.number().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'WARNING', 'ERROR', 'UNKNOWN'] as const),
    location: ProviderPlantLocationSchema,
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
})

export const ListProviderPlantsRequestSchema = z.object({
    provider: ProviderEnum,
    credentials: CredentialsSchema
})

export const ListProviderPlantsResponseSchema = z.object({
    plants: z.array(ProviderPlantSchema)
})

export type ListProviderPlantsRequest = z.infer<typeof ListProviderPlantsRequestSchema>
export type ListProviderPlantsResponse = z.infer<typeof ListProviderPlantsResponseSchema>

export class ListProviderPlantsUseCase {
    async execute(request: ListProviderPlantsRequest): Promise<ListProviderPlantsResponse> {
        const validatedRequest = ListProviderPlantsRequestSchema.parse(request)

        const overrides: Partial<InverterModel> = {}
        if (validatedRequest.credentials?.account) {
            overrides.providerApiKey = validatedRequest.credentials.account
        }
        if (validatedRequest.credentials?.password) {
            overrides.providerApiSecret = validatedRequest.credentials.password
        }
        if (validatedRequest.credentials?.providerUrl) {
            overrides.providerUrl = validatedRequest.credentials.providerUrl
        }

        const inverterRepository = InverterApiFactory.createForProvider(validatedRequest.provider, overrides)
        const plants: ProviderPlant[] = await inverterRepository.listPlants()

        return ListProviderPlantsResponseSchema.parse({ plants })
    }
}
