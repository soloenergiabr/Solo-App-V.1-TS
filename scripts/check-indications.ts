import { PrismaClient } from '../src/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    const indications = await prisma.indication.findMany({
        include: { referrer: true, referred: true }
    });

    console.log('=== INDICAÇÕES ===');
    indications.forEach(i => {
        console.log(`ID: ${i.id}`);
        console.log(`  Referrer: ${i.referrer?.name || 'N/A'}`);
        console.log(`  Referred: ${i.referred?.name || 'N/A'}`);
        console.log(`  Status: ${i.status}`);
        console.log(`  ProjectValue: ${i.projectValue}`);
        console.log(`  JestorId: ${i.jestorId}`);
        console.log('---');
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
