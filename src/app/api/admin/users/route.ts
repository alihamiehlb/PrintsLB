import { Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// GET all users (Admin only)
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                password: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                        printJobs: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Map password to a boolean to hide the hash but indicate credentials status
        const mappedUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            hasPassword: !!user.password,
            _count: user._count
        }))

        return NextResponse.json(mappedUsers)
    } catch (error: any) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

// PUT update user (role or password) (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId, role, password } = await parseJsonBody<{ userId: string; role?: Role; password?: string }>(request)

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        const updateData: any = {}
        if (role) {
            // Prevent self-demoting
            if (role === 'USER') {
                const targetUser = await prisma.user.findUnique({ where: { id: userId } })
                if (targetUser?.email === session.user.email) {
                    return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 })
                }
            }
            updateData.role = role
        }
        if (password) {
            updateData.password = await hashPassword(password)
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: updateData
        })

        return NextResponse.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            hasPassword: !!user.password
        })
    } catch (error: any) {
        console.error('Error updating user:', error)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

// DELETE a user (Admin only)
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }

        // Check if trying to delete self
        const targetUser = await prisma.user.findUnique({ where: { id: userId } })
        if (targetUser?.email === session.user.email) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })
        }

        // Delete dependent accounts first
        await prisma.account.deleteMany({ where: { userId } })
        
        // Clean up related orders and order trackings
        const userOrders = await prisma.order.findMany({ where: { userId } })
        const orderIds = userOrders.map(o => o.id)
        await prisma.orderTracking.deleteMany({ where: { orderId: { in: orderIds } } })
        await prisma.order.deleteMany({ where: { userId } })
        
        // Clean up print jobs
        await prisma.printJob.deleteMany({ where: { userId } })

        const user = await prisma.user.delete({
            where: { id: userId }
        })

        return NextResponse.json({ success: true, userId: user.id })
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}
