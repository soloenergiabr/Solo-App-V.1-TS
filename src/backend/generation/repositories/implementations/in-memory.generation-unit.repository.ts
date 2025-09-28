import { GenerationUnitModel } from "../../models/generation-unit.model"
import { GenerationUnitRepository } from "../generation-unit.repository"

export class InMemoryGenerationUnitRepository implements GenerationUnitRepository {

    private generationUnits: GenerationUnitModel[] = []

    create(generationUnit: GenerationUnitModel): Promise<void> {
        this.generationUnits.push(generationUnit)
        return Promise.resolve()
    }

    deleteAll(): Promise<void> {
        this.generationUnits = []
        return Promise.resolve()
    }

    findByInverterId(inverterId: string): Promise<GenerationUnitModel[]> {
        return Promise.resolve(this.generationUnits.filter(generationUnit => generationUnit.inverterId === inverterId))
    }

    update(generationUnit: GenerationUnitModel): Promise<void> {
        const index = this.generationUnits.findIndex(generationUnit => generationUnit.id === generationUnit.id)
        if (index === -1) {
            throw new Error("Generation unit not found")
        }
        this.generationUnits[index] = generationUnit
        return Promise.resolve()
    }
}