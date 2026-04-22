/**
 * Quick test script for the Hoymiles integration.
 * Reads credentials from .env — no database needed.
 *
 * Run with:
 *   npx tsx scripts/test-hoymiles.ts
 */

import 'dotenv/config'
import { HoymilesInverterApiRepository } from '../src/backend/generation/repositories/implementations/hoymiles.inverter-api.repository'
import { InverterModel } from '../src/backend/generation/models/inverter.model'

const STATION_ID = '11972460'

async function main() {
    console.log('=== Hoymiles API Test ===')
    console.log(`Station ID : ${STATION_ID}`)
    console.log(`Account    : ${process.env.HOYMILES_ADMIN_ACCOUNT}`)
    console.log('')

    const inverter = new InverterModel(
        'test-hoymiles',
        'Hoymiles Test',
        'hoymiles',
        STATION_ID,
        process.env.HOYMILES_ADMIN_ACCOUNT,
        process.env.HOYMILES_ADMIN_PASSWORD,
        process.env.HOYMILES_API_URL
    )

    const repo = new HoymilesInverterApiRepository(inverter)

    try {
        console.log('1. Testing real-time generation...')
        const realTime = await repo.getRealTimeGeneration()
        console.log(`   Power  : ${realTime.power.toFixed(3)} kW`)
        console.log(`   Energy : ${realTime.energy.toFixed(3)} kWh (today)`)
        console.log('')

        console.log('2. Testing generation by day...')
        const day = await repo.getGenerationByDay()
        console.log(`   Today  : ${day.toFixed(3)} kWh`)
        console.log('')

        console.log('3. Testing generation by month...')
        const month = await repo.getGenerationByMonth()
        console.log(`   Month  : ${month.toFixed(3)} kWh`)
        console.log('')

        console.log('4. Testing generation by year...')
        const year = await repo.getGenerationByYear()
        console.log(`   Year   : ${year.toFixed(3)} kWh`)
        console.log('')

        console.log('5. Testing plant list...')
        const plants = await repo.listPlants()
        console.log(`   Found ${plants.length} plant(s):`)
        plants.forEach(p => {
            console.log(`   - [${p.id}] ${p.name} | ${p.capacityKw} kW | ${p.status}`)
        })
        console.log('')

        console.log('SUCCESS - Hoymiles integration is working!')
    } catch (error: any) {
        console.error('FAILED:', error.message)
        process.exit(1)
    }
}

main()
