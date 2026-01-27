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

    const totalRevenueValue = totalRevenue._sum.totalAmount || 0
    const totalProfitValue = totalRevenueValue * 0.2 // Assuming 20% margin if not tracked elsewhere

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenueValue,
      totalProfit: totalProfitValue,
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
