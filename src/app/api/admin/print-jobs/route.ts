import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all orders with user details
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Map to the format expected by the frontend 'PrintJob' interface
    const printJobs = orders.map(order => {
      const notes = order.notes || ''
      const fileMatch = notes.match(/File: (.*)/)
      const materialMatch = notes.match(/Material: (.*)/)

      return {
        id: order.id,
        orderId: order.id,
        fileName: fileMatch ? fileMatch[1] : 'Unknown File',
        materialName: materialMatch ? materialMatch[1] : 'Unknown Material',
        totalPrice: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        userName: order.user?.name || order.user?.email || 'Unknown User',
        customerNotes: notes,
        fileUrl: order.fileUrl
      }
    })

    return NextResponse.json(printJobs)

  } catch (error: any) {
    console.error('Error fetching print jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch print jobs' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { id, status } = data

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true }
    })

    // Add tracking entry
    await prisma.orderTracking.create({
      data: {
        orderId: id,
        status: status,
        description: `Order status updated to ${status} by Admin`
      }
    })

    return NextResponse.json({ success: true, order: updatedOrder })

  } catch (error: any) {
    console.error("Error updating print job:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
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
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Delete order (cascading delete should handle relations if schema allows, or we delete manually)
    // Schema: Order has relation to PrintJob (optional) and Tracking (cascading?)
    // Let's delete Order. Related tracking should be deleted if set to Cascade in Prisma, 
    // but better to use a transaction or rely on relation settings.
    // Checking schema: Tracking relations don't have explicit onDelete: Cascade in the visible snippet,
    // so we might need to delete related records first or ensure schema handles it.
    // For now, let's try deleting Order. If it fails due to FK constraint, we fix schema or logic.

    // Deleting order tracking first to be safe
    await prisma.orderTracking.deleteMany({
      where: { orderId: id }
    })

    const deletedOrder = await prisma.order.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Order deleted successfully' })

  } catch (error: any) {
    console.error("Error deleting print job:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
