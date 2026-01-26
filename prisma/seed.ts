import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function main() {
  console.log('Seeding database...')

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@printslb.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)
    
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log(`Admin user created: ${adminEmail}`)
  } else {
    console.log('Admin user already exists')
  }

  // Seed materials for 3D printing
  const materials = [
    {
      name: 'PLA',
      description: 'Eco-friendly and easy to print material',
      color: 'White',
      pricePerGram: 0.025,
      available: true,
      printerType: 'FDM'
    },
    {
      name: 'PLA',
      description: 'Eco-friendly and easy to print material',
      color: 'Black',
      pricePerGram: 0.025,
      available: true,
      printerType: 'FDM'
    },
    {
      name: 'PETG',
      description: 'Durable and chemical resistant material',
      color: 'Transparent',
      pricePerGram: 0.030,
      available: true,
      printerType: 'FDM'
    },
    {
      name: 'TPU',
      description: 'Flexible and impact resistant material',
      color: 'Black',
      pricePerGram: 0.045,
      available: true,
      printerType: 'FDM'
    },
    {
      name: 'PLA',
      description: 'Eco-friendly and easy to print material',
      color: 'Red',
      pricePerGram: 0.028,
      available: true,
      printerType: 'FDM'
    },
    {
      name: 'PLA',
      description: 'Eco-friendly and easy to print material',
      color: 'Blue',
      pricePerGram: 0.028,
      available: true,
      printerType: 'FDM'
    }
  ]

  for (const material of materials) {
    const existingMaterial = await prisma.material.findFirst({
      where: { 
        name: material.name,
        color: material.color
      }
    })

    if (!existingMaterial) {
      await prisma.material.create({
        data: material
      })
      console.log(`Material created: ${material.name} (${material.color})`)
    } else {
      console.log(`Material already exists: ${material.name} (${material.color})`)
    }
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
