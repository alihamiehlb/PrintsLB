import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
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

    const [totalOrders, totalUsers, totalRevenue, totalProfit, pendingOrders] = await Promise.all([
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      }),
      prisma.printJob.aggregate({
        _sum: { profit: true }
      }),
      prisma.order.count({
        where: { status: 'PENDING' }
      })
    ])

    const totalRevenueValue = totalRevenue._sum.totalAmount || 0
    const totalProfitValue = totalProfit._sum.profit || 0

    // Material Popularity
    const materialStats = await prisma.printJob.groupBy({
      by: ['materialId'],
      _count: { id: true },
      where: { order: { NOT: { status: 'CANCELLED' } } }
    })

    const materials = await prisma.material.findMany({
      where: { id: { in: materialStats.map(m => m.materialId).filter((id): id is string => id !== null) } },
      select: { id: true, name: true }
    })

    const materialDistribution = materialStats.map(stat => ({
      name: materials.find(m => m.id === stat.materialId)?.name || 'Unknown',
      value: stat._count.id
    }))

    // 30-day Revenue History
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { notIn: ['CANCELLED'] } // OrderStatus doesn't have FAILED
      },
      select: { createdAt: true, totalAmount: true }
    })

    const dailyRevenue: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dailyRevenue[d.toISOString().split('T')[0]] = 0
    }

    recentOrders.forEach(order => {
      const day = order.createdAt.toISOString().split('T')[0]
      if (dailyRevenue[day] !== undefined) {
        dailyRevenue[day] += order.totalAmount
      }
    })

    const revenueHistory = Object.entries(dailyRevenue)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        name: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        revenue: item.amount
      }))

    return NextResponse.json({
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenueValue,
      totalProfit: totalProfitValue,
      pendingOrders,
      materialDistribution,
      revenueHistory
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
