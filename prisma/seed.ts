import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function main() {
  console.log('Seeding database...')

  // 1. Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'alihamiehlb@gmail.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'ali2009'
  const hashedAdminPassword = await hashPassword(adminPassword)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
      role: 'ADMIN'
    },
    create: {
      email: adminEmail,
      name: 'Ali Hamieh',
      password: hashedAdminPassword,
      role: 'ADMIN'
    }
  })
  console.log('Admin user ensured:', admin.email)

  // 2. Create default pricing setting
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
  console.log('Pricing setting ensured:', pricingSetting.id)

  // 3. Create default materials
  const materials = [
    { name: 'PLA', pricePerGram: 0.05, description: 'Easy to print, eco-friendly' },
    { name: 'PETG', pricePerGram: 0.07, description: 'Durable and heat resistant' },
    { name: 'TPU', pricePerGram: 0.12, description: 'Flexible and rubber-like' },
    { name: 'ABS', pricePerGram: 0.06, description: 'Strong and impact resistant' }
  ]

  for (const material of materials) {
    const existing = await prisma.material.findFirst({
      where: { name: material.name }
    })

    if (existing) {
      await prisma.material.update({
        where: { id: existing.id },
        data: {
          pricePerGram: material.pricePerGram,
          description: material.description
        }
      })
    } else {
      await prisma.material.create({
        data: {
          name: material.name,
          pricePerGram: material.pricePerGram,
          description: material.description,
          color: 'Default',
          printerType: 'FDM'
        }
      })
    }
  }
  console.log('Materials ensured')

  // 4. Create sample products for the collection
  const products = [
    {
      name: 'Geometric Planter',
      description: 'A modern geometric planter for your small succulents.',
      price: 15.00,
      category: 'Home Décor',
      inStock: true,
      stockCount: 10
    },
    {
      name: 'Phone Stand',
      description: 'A minimalist desk phone stand compatible with all smartphones.',
      price: 8.00,
      category: 'Office',
      inStock: true,
      stockCount: 25
    }
  ]

  for (const product of products) {
    const existingP = await prisma.product.findFirst({
      where: { name: product.name }
    })

    if (existingP) {
      await prisma.product.update({
        where: { id: existingP.id },
        data: product
      })
    } else {
      await prisma.product.create({
        data: product
      })
    }
  }
  console.log('Products ensured')

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
