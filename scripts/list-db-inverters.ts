import 'dotenv/config'
import prisma from '../src/lib/prisma'

async function main() {
  console.log('=== Database Inverters ===')
  try {
    const inverters = await prisma.inverter.findMany({
      include: {
        client: true
      }
    })
    console.log(`Found ${inverters.length} inverter(s) in database:\n`)
    for (const inverter of inverters) {
      console.log(`- ID: ${inverter.id}`)
      console.log(`  Name: ${inverter.name}`)
      console.log(`  Provider: ${inverter.provider}`)
      console.log(`  Provider ID (Station ID): ${inverter.providerId}`)
      console.log(`  Client: ${inverter.client?.name} (${inverter.client?.email})`)
      console.log(`  Created At: ${inverter.createdAt}`)
      console.log('------------------------------------')
    }
  } catch (error: any) {
    console.error('Error fetching inverters:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
