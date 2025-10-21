import { uuid } from "@/lib/uuid"

export type GenerationUnitType = 'real_time' | 'day' | 'month' | 'year'

export class GenerationUnitModel {
    id: string
    power: number
    energy: number
    generationUnitType: GenerationUnitType
    inverterId: string
    timestamp: Date


    constructor(
        { id, power, energy, generationUnitType, inverterId, timestamp }: {
            id?: string,
            power: number,
            energy: number,
            generationUnitType: GenerationUnitType,
            inverterId: string,
            timestamp?: Date
        }
    ) {
        this.id = id ?? `generation_unit_${uuid()}`
        this.power = power
        this.energy = energy
        this.generationUnitType = generationUnitType
        this.inverterId = inverterId
        this.timestamp = timestamp || new Date()
    }
}