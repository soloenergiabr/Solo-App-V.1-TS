import { uuid } from "@/lib/uuid"

export class ClientModel {
    id: string
    name: string
    email: string
    cpfCnpj: string
    phone?: string
    address?: string
    avgEnergyCost?: number
    enelInvoiceFile?: string
    indicationCode: string
    status: string
    createdAt: Date
    updatedAt: Date

    constructor(
        { id, name, email, cpfCnpj, phone, address, avgEnergyCost, enelInvoiceFile, indicationCode, status, createdAt, updatedAt }: {
            id?: string,
            name: string,
            email: string,
            cpfCnpj: string,
            phone?: string,
            address?: string,
            avgEnergyCost?: number,
            enelInvoiceFile?: string,
            indicationCode: string,
            status: string,
            createdAt?: Date,
            updatedAt?: Date
        }
    ) {
        this.id = id ?? `client_${uuid()}`
        this.name = name
        this.email = email
        this.cpfCnpj = cpfCnpj
        this.phone = phone
        this.address = address
        this.avgEnergyCost = avgEnergyCost
        this.enelInvoiceFile = enelInvoiceFile
        this.indicationCode = indicationCode
        this.status = status
        this.createdAt = createdAt ?? new Date()
        this.updatedAt = updatedAt ?? new Date()
    }
}