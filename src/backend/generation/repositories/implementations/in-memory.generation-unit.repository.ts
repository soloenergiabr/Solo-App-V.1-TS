import { GenerationUnitModel } from "../../models/generation-unit.model"
import { GenerationUnitQuery, GenerationUnitRepository } from "../generation-unit.repository"

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

    findByInverterIds(inverterIds: string[], options?: GenerationUnitQuery): Promise<GenerationUnitModel[]> {
        let filtered = this.generationUnits.filter(unit => inverterIds.includes(unit.inverterId));

        if (options?.generationUnitType) {
            filtered = filtered.filter(unit => unit.generationUnitType === options.generationUnitType);
        }

        if (options?.startDate) {
            filtered = filtered.filter(unit => new Date(unit.timestamp) >= options.startDate!);
        }

        if (options?.endDate) {
            filtered = filtered.filter(unit => new Date(unit.timestamp) <= options.endDate!);
        }

        return Promise.resolve(filtered);
    }

    update(generationUnit: GenerationUnitModel): Promise<void> {
        const index = this.generationUnits.findIndex(current => current.id === generationUnit.id)
        if (index === -1) {
            throw new Error("Generation unit not found")
        }
        this.generationUnits[index] = generationUnit
        return Promise.resolve()
    }
}
