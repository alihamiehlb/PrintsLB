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

        const data = await parseJsonBody<{
            taxRate: string | number
            serviceFee: string | number
            scaleMultiplier: string | number
        }>(request)
        const { taxRate, serviceFee, scaleMultiplier } = data

        const settings = await prisma.pricingSetting.upsert({
            where: { id: 'default' },
            update: {
                taxRate: Number(taxRate),
                serviceFee: Number(serviceFee),
                scaleMultiplier: Number(scaleMultiplier)
            },
            create: {
                id: 'default',
                taxRate: Number(taxRate),
                serviceFee: Number(serviceFee),
                scaleMultiplier: Number(scaleMultiplier)
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Failed to update pricing settings:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
