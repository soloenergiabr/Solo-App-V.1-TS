import { InverterModel } from "../../models/inverter.model";
import { InverterRepository } from "../inverter.repository";

export class InMemoryInverterRepository implements InverterRepository {

    private inverters: InverterModel[] = []

    create(inverter: InverterModel): Promise<void> {
        this.inverters.push(inverter)
        return Promise.resolve()
    }
    find(): Promise<InverterModel[]> {
        return Promise.resolve(this.inverters)
    }
    findById(id: string): Promise<InverterModel> {
        const inverter = this.inverters.find(inverter => inverter.id === id)
        if (!inverter) {
            throw new Error("Inverter not found")
        }
        return Promise.resolve(inverter)
    }
    update(inverter: InverterModel): Promise<void> {
        const index = this.inverters.findIndex(inverter => inverter.id === inverter.id)
        if (index === -1) {
            throw new Error("Inverter not found")
        }
        this.inverters[index] = inverter
        return Promise.resolve()
    }
    findByClientId(clientId: string): Promise<InverterModel[]> {
        return Promise.resolve(this.inverters.filter(inverter => inverter.clientId === clientId))
    }
}
