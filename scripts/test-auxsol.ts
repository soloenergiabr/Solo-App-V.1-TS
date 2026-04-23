/**
 * Quick test script for the AUXSOL / Nansen integration.
 * Reads credentials from .env — no database needed.
 *
 * Run with:
 *   npx tsx scripts/test-auxsol.ts
 */

import 'dotenv/config'
import { AuxsolInverterApiRepository } from '../src/backend/generation/repositories/implementations/auxsol.inverter-api.repository'
import { InverterModel } from '../src/backend/generation/models/inverter.model'

async function main() {
    const appId = process.env.AUXSOL_APP_ID
    const appSecret = process.env.AUXSOL_APP_SECRET
    const baseUrl = process.env.AUXSOL_BASE_URL

    console.log('=== AUXSOL / Nansen API Test ===')
    console.log(`Base URL : ${baseUrl ?? '(default)'}`)
    console.log(`App ID   : ${appId ?? '(not set)'}`)
    console.log(`Secret   : ${appSecret ? '***' + appSecret.slice(-4) : '(not set)'}`)
    console.log('')

    if (!appId || !appSecret) {
        console.error('ERROR: AUXSOL_APP_ID and AUXSOL_APP_SECRET must be set in .env')
        process.exit(1)
    }

    // Create a minimal InverterModel with master credentials.
    // providerId is empty because we're testing listPlants (account-level), not a
    // specific inverter SN.
    const inverter = new InverterModel(
        'test-auxsol',
        'AUXSOL Test',
        'auxsol',
        '',            // providerId — not needed for listPlants
        appId,
        appSecret,
        baseUrl
    )

    const repo = new AuxsolInverterApiRepository(inverter)

    try {
        // ── 1. List plants ────────────────────────────────────────────
        console.log('1. Testing plant list (listPlants)...')
        const plants = await repo.listPlants()
        console.log(`   ✅ Found ${plants.length} plant(s):`)
        console.log('')

        for (const p of plants) {
            console.log(`   ┌─ [${p.id}] ${p.name}`)
            console.log(`   │  Capacity   : ${p.capacityKw ?? '—'} kWp`)
            console.log(`   │  TotalEnergy: ${p.totalEnergy ?? '—'} kWh`)
            console.log(`   │  Status     : ${p.status}`)
            console.log(`   │  Address    : ${p.location?.address ?? '—'}`)
            console.log(`   │  Created    : ${p.createdAt?.toISOString() ?? '—'}`)
            console.log(`   └─ Updated    : ${p.updatedAt?.toISOString() ?? '—'}`)
            console.log('')
        }

        // ── 2. Real-time generation for first plant's inverter (if any) ───
        if (plants.length > 0) {
            const firstPlant = plants[0]
            console.log(`2. Testing real-time generation for plant "${firstPlant.name}" (id: ${firstPlant.id})...`)
            console.log('   ⚠  Note: real-time data requires a valid inverter SN (providerId).')
            console.log('   Skipping — this test only validates authentication + plant listing.')
            console.log('')
        }

        console.log('═══════════════════════════════════════')
        console.log('✅ SUCCESS — AUXSOL integration is working!')
        console.log('═══════════════════════════════════════')
    } catch (error: any) {
        console.error('')
        console.error('═══════════════════════════════════════')
        console.error('❌ FAILED:', error.message)
        console.error('═══════════════════════════════════════')

        if (error.message?.includes('auth')) {
            console.error('')
            console.error('Hint: Check that AUXSOL_APP_ID and AUXSOL_APP_SECRET are correct.')
            console.error('      App ID should be 20879 (master account).')
        }

        if (error.message?.includes('ENOTFOUND') || error.message?.includes('ECONNREFUSED')) {
            console.error('')
            console.error('Hint: Check AUXSOL_BASE_URL — the confirmed production URL is:')
            console.error('      https://eu.auxsolcloud.com/auxsol-api')
        }

        process.exit(1)
    }
}

main()
