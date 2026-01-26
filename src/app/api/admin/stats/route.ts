import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const [totalOrders, totalUsers, totalRevenue, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      })
    ])

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingOrders
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
