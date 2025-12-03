import { PrismaTransactionRepository } from "@/backend/club/repositories/implementations/prisma.transaction.repository";
import { TransactionService } from "@/backend/club/services/transaction.service";
import prisma from "@/lib/prisma";

const clienteReferral = async () => {
    // Status lead -> client
    // Criar um usuário pro cliente
    // Criar uma transcacao de entrada do tipo indicacao no client que indicou com 5% do vlaor total do projeto
}

export const POST = clienteReferral;