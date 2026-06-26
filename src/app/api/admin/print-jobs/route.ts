import { OrderStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        printJob: {
          include: {
            material: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const printJobs = orders.map((order: any) => ({
      id: order.id,
      status: order.status,
      totalPrice: order.totalAmount,
      baseCost: order.printJob?.baseCost || 0,
      profit: order.printJob?.profit || 0,
      createdAt: order.createdAt.toISOString(),
      userName: (order.user as any)?.name || (order.user as any)?.email || 'Unknown User',
      customerNotes: order.notes || 'No notes provided',
      fileUrl: order.fileUrl || '',
      fileName: order.printJob?.fileName || 'Unknown File',
      materialName: order.printJob?.material?.name || 'Standard',
      phoneNumber: order.phoneNumber || 'N/A'
    }))

    return NextResponse.json(printJobs)
  } catch (error) {
    console.error('Failed to fetch print jobs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status, baseCost, totalPrice } = await parseJsonBody<{
      id: string
      status?: string
      baseCost?: string | number
      totalPrice?: string | number
    }>(request)

    // Find the order first to get printJobId
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { printJob: true }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update PrintJob if costs are provided
    if (existingOrder.printJobId && (baseCost !== undefined || totalPrice !== undefined)) {
      const newBaseCost = baseCost !== undefined ? Number(baseCost) : existingOrder.printJob?.baseCost || 0
      const newTotalPrice = totalPrice !== undefined ? Number(totalPrice) : existingOrder.totalAmount || 0
      const newProfit = newTotalPrice - newBaseCost

      await prisma.printJob.update({
        where: { id: existingOrder.printJobId },
        data: {
          baseCost: newBaseCost,
          totalPrice: newTotalPrice,
          profit: newProfit
        }
      })
    }

    // Update Order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: (status as OrderStatus) || existingOrder.status,
        totalAmount: totalPrice !== undefined ? Number(totalPrice) : existingOrder.totalAmount,
        tracking: status ? {
          create: {
            status: status,
            description: `Order updated by admin`
          }
        } : undefined
      }
    })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Failed to update order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    // Delete tracking and order in a transaction
    await prisma.$transaction([
      prisma.orderTracking.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
