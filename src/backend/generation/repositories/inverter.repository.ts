import { InverterModel } from "../models/inverter.model"

export interface InverterRepository {
    create(inverter: InverterModel): Promise<void>
    find(): Promise<InverterModel[]>
    findById(id: string): Promise<InverterModel>
    update(inverter: InverterModel): Promise<void>
}