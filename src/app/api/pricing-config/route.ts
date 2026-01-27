import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET active pricing config
export async function GET(request: NextRequest) {
    try {
        const settings = await prisma.pricingSetting.findUnique({
            where: { id: 'default' }
        })

        // Map PricingSetting to the format expected by the frontend
        if (!settings) {
            return NextResponse.json({
                sizeMultiplier: 1.0,
                taxPercentage: 0.0,
                baseFee: 2.5
            })
        }

        return NextResponse.json({
            sizeMultiplier: settings.scaleMultiplier,
            taxPercentage: settings.taxRate,
            baseFee: settings.serviceFee
        })
    } catch (error: any) {
        console.error('Error fetching pricing config:', error)
        return NextResponse.json({
            sizeMultiplier: 1.0,
            taxPercentage: 0.0,
            baseFee: 2.5
        })
    }
}
