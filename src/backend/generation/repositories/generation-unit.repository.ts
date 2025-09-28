import { GenerationUnitModel } from "../models/generation-unit.model"

export interface GenerationUnitRepository {
    create(generationUnit: GenerationUnitModel): Promise<void>
    findByInverterId(inverterId: string): Promise<GenerationUnitModel[]>
    update(generationUnit: GenerationUnitModel): Promise<void>
    deleteAll(): Promise<void>
}