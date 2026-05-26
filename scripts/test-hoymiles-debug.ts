/**
 * Debug script — dumps raw Hoymiles station list + real-time data for each station.
 *
 * Run with:
 *   npx tsx scripts/test-hoymiles-debug.ts
 */

import 'dotenv/config'
import { createHash } from 'node:crypto'
import axios from 'axios'

const BASE_URL = process.env.HOYMILES_API_URL ?? 'https://neapi.hoymiles.com'
const USERNAME = process.env.HOYMILES_ADMIN_ACCOUNT!
const PASSWORD = process.env.HOYMILES_ADMIN_PASSWORD!

async function login(): Promise<string> {
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'HomeAssistant-HoymilesCloud',
    }

    // Try legacy first
    const md5Password = createHash('md5').update(PASSWORD).digest('hex')
    try {
        const resp = await axios.post(`${BASE_URL}/iam/pub/0/auth/login`, {
            user_name: USERNAME,
            password: md5Password,
        }, { headers })
        if (resp.data?.status === '0' && resp.data?.data?.token) {
            return resp.data.data.token
        }
    } catch { /* fallthrough */ }

    // Try v3
    const preResp = await axios.post(`${BASE_URL}/iam/pub/3/auth/pre-insp`, { u: USERNAME }, { headers })
    const nonce = preResp.data?.data?.n
    const sha256B64 = createHash('sha256').update(PASSWORD).digest('base64')
    const ch = `${md5Password}.${sha256B64}`
    const loginResp = await axios.post(`${BASE_URL}/iam/pub/3/auth/login`, { u: USERNAME, ch, n: nonce }, { headers })
    if (loginResp.data?.status === '0') {
        return loginResp.data.data.token
    }
    throw new Error('Login failed')
}

async function main() {
    console.log('=== Hoymiles Debug — Raw API Responses ===\n')

    const token = await login()
    console.log('✅ Authenticated\n')

    const authHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token,
    }

    // 1. List all stations — dump raw response
    console.log('── Station List (raw) ──────────────────────')
    const stationResp = await axios.post(
        `${BASE_URL}/pvm/api/0/station/select_by_page`,
        { page_size: 100, page_num: 1 },
        { headers: authHeaders }
    )
    const stations = stationResp.data?.data?.list ?? []
    console.log(JSON.stringify(stations, null, 2))
    console.log(`\nTotal stations: ${stations.length}\n`)

    // 2. For each station, pull real-time data
    for (const station of stations) {
        const sid = station.id ?? station.sid ?? station.station_id
        console.log(`── Real-time data for "${station.name}" (id: ${sid}) ──`)
        try {
            const rtResp = await axios.post(
                `${BASE_URL}/pvm-data/api/0/station/data/count_station_real_data`,
                { sid: Number(sid) },
                { headers: authHeaders }
            )
            console.log(JSON.stringify(rtResp.data?.data, null, 2))
        } catch (err: any) {
            console.log(`  ERROR: ${err.message}`)
        }
        console.log('')
    }
}

main().catch(err => {
    console.error('FATAL:', err.message)
    process.exit(1)
})
