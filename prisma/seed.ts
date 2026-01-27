import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default pricing setting
  const pricingSetting = await prisma.pricingSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      taxRate: 10.0,   // 10% markup/tax
      serviceFee: 1.0,          // $1 base fee
      scaleMultiplier: 1.0
    }
  })

  console.log('Created pricing setting:', pricingSetting)
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
