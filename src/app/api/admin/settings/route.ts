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

        let settings = await prisma.pricingSetting.findUnique({
            where: { id: 'default' }
        })

        if (!settings) {
            settings = await prisma.pricingSetting.create({
                data: { id: 'default' }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to get pricing settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await request.json()
        const { taxRate, serviceFee, scaleMultiplier } = data

        const settings = await prisma.pricingSetting.upsert({
            where: { id: 'default' },
            update: {
                taxRate: parseFloat(taxRate),
                serviceFee: parseFloat(serviceFee),
                scaleMultiplier: parseFloat(scaleMultiplier)
            },
            create: {
                id: 'default',
                taxRate: parseFloat(taxRate),
                serviceFee: parseFloat(serviceFee),
                scaleMultiplier: parseFloat(scaleMultiplier)
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to update pricing settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
