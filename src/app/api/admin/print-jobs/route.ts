import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const printJobs = orders.map(order => {
      let notes = 'No notes provided'
      try {
        if (order.notes) {
          notes = order.notes
        }
      } catch (e) { }

      return {
        id: order.id,
        status: order.status,
        totalPrice: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
        userName: (order.user as any)?.name || (order.user as any)?.email || 'Unknown User',
        customerNotes: notes,
        fileUrl: (order as any).fileUrl
      }
    })

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

    const { id, status } = await request.json()

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status,
        tracking: {
          create: {
            status: status,
            description: `Order status updated to ${status}`
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to update order status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await request.json()

    // Delete tracking first
    await prisma.orderTracking.deleteMany({
      where: { orderId: id }
    })

    const order = await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to delete order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
