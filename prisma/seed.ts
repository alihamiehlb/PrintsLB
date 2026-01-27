import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create default pricing config
  const pricingConfig = await prisma.pricingConfig.upsert({
    where: { name: 'default' },
    update: {},
    create: {
      name: 'default',
      sizeMultiplier: 0.5,  // Moderate size impact
      taxPercentage: 10.0,   // 10% markup/tax
      baseFee: 1.0,          // $1 base fee
      isActive: true
    }
  })

  console.log('Created pricing config:', pricingConfig)
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
