import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active pricing config
export async function GET(request: NextRequest) {
    try {
        const config = await prisma.pricingConfig.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        })

        // Return default if no config exists
        if (!config) {
            return NextResponse.json({
                sizeMultiplier: 1.0,
                taxPercentage: 0.0,
                baseFee: 0.0
            })
        }

        return NextResponse.json(config)
    } catch (error: any) {
        console.error('Error fetching pricing config:', error)
        return NextResponse.json({
            sizeMultiplier: 1.0,
            taxPercentage: 0.0,
            baseFee: 0.0
        })
    }
}
