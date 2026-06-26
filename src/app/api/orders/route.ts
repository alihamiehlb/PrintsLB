import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await parseJsonBody<{
      materialName: string
      fileName: string
      fileSize: number
      materialUsed?: number
      totalPrice: string | number
      customerNotes?: string
      fileUrl?: string
      phoneNumber?: string
    }>(request)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find material based on name
    const material = await prisma.material.findFirst({
      where: { name: data.materialName }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found: ' + data.materialName }, { status: 400 })
    }

    // 1. Create PrintJob first
    const printJob = await prisma.printJob.create({
      data: {
        userId: user.id,
        materialId: material.id,
        fileName: data.fileName,
        fileSize: data.fileSize,
        printTime: 0,
        materialUsed: data.materialUsed || 0,
        baseCost: (material.pricePerGram * (data.materialUsed || 0)),
        profit: 2.50,
        totalPrice: Number(data.totalPrice),
        status: 'PENDING',
        notes: data.customerNotes
      }
    })

    // 2. Create Order linked to PrintJob
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount: Number(data.totalPrice),
        notes: data.customerNotes || '',
        fileUrl: data.fileUrl,
        phoneNumber: data.phoneNumber,
        printJobId: printJob.id,
        tracking: {
          create: {
            status: 'PENDING',
            description: 'Order received',
          }
        }
      } as any,
      include: {
        printJob: true,
        tracking: true
      }
    })

    return NextResponse.json({
      success: true,
      order: order,
      message: 'Order placed successfully!'
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order: ' + error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json([], { status: 200 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { printJob: true, tracking: true }
    })

    return NextResponse.json(orders)

  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders: ' + error.message }, { status: 500 })
  }
}
