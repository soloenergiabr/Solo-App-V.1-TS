
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const indications = await prisma.indication.findMany({
        include: {
            referred: true,
            referrer: true,
        },
    });

    console.log('--- Indications Debug ---');
    indications.forEach(ind => {
        console.log(`ID: ${ind.id}`);
        console.log(`Referred: ${ind.referred.name}`);
        console.log(`Status: ${ind.status}`);
        console.log(`ProjectValue: ${ind.projectValue}`);
        console.log(`JestorID: ${ind.jestorId}`);
        console.log('-------------------------');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
