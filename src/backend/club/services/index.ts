import { PrismaIndicationRepository } from "../repositories/implementations/prisma.indication.repository";
import { PrismaTransactionRepository } from "../repositories/implementations/prisma.transaction.repository";
import { PrismaOfferRepository } from "../repositories/implementations/prisma.offer.repository";
import { ClubService } from "../services/club.service";
import prisma from "@/lib/prisma";

const indicationRepository = new PrismaIndicationRepository(prisma);
const transactionRepository = new PrismaTransactionRepository(prisma);
const offerRepository = new PrismaOfferRepository(prisma);
const clubService = new ClubService(indicationRepository, transactionRepository, offerRepository);

export { clubService };
