import { GenerationUnitModel } from "../models/generation-unit.model"

export interface GenerationUnitQuery {
    generationUnitType?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface GenerationUnitRepository {
    create(generationUnit: GenerationUnitModel): Promise<void>
    findByInverterId(inverterId: string): Promise<GenerationUnitModel[]>
    findByInverterIds(inverterIds: string[], options?: GenerationUnitQuery): Promise<GenerationUnitModel[]>
    update(generationUnit: GenerationUnitModel): Promise<void>
    deleteAll(): Promise<void>
}