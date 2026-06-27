import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'
import { getClientIp } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/sanitize'

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
      turnstileToken?: string
    }>(request)

    // Sanitize text inputs
    const materialName = sanitizeText(data.materialName || '')
    const fileName = sanitizeText(data.fileName || '')
    const customerNotes = sanitizeText(data.customerNotes || '')
    const phoneNumber = sanitizeText(data.phoneNumber || '')

    if (isTurnstileConfigured()) {
      const captcha = await verifyTurnstileToken(
        data.turnstileToken,
        getClientIp(request.headers)
      )
      if (!captcha.ok) {
        return NextResponse.json({ error: captcha.error }, { status: 400 })
      }
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find material based on name
    const material = await prisma.material.findFirst({
      where: { name: materialName }
    })

    if (!material) {
      return NextResponse.json({ error: 'Material not found: ' + materialName }, { status: 400 })
    }

    // 1. Create PrintJob first
    const printJob = await prisma.printJob.create({
      data: {
        userId: user.id,
        materialId: material.id,
        fileName: fileName,
        fileSize: data.fileSize,
        printTime: 0,
        materialUsed: data.materialUsed || 0,
        baseCost: (material.pricePerGram * (data.materialUsed || 0)),
        profit: 2.50,
        totalPrice: Number(data.totalPrice),
        status: 'PENDING',
        notes: customerNotes
      }
    })

    // 2. Create Order linked to PrintJob
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PENDING',
        totalAmount: Number(data.totalPrice),
        notes: customerNotes,
        fileUrl: data.fileUrl,
        phoneNumber: phoneNumber,
        printJobId: printJob.id,
        tracking: {
          create: {
            status: 'PENDING',
            description: 'Order received',
          }
        }
      },
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
