import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedJson, setCachedJson } from '@/lib/cache'

interface PricingConfigResponse {
    sizeMultiplier: number
    taxPercentage: number
    baseFee: number
}

const PRICING_CACHE_KEY = 'pricing-config:default'

// GET active pricing config
export async function GET(request: NextRequest) {
    try {
        const cached = await getCachedJson<PricingConfigResponse>(PRICING_CACHE_KEY)
        if (cached) {
            return NextResponse.json(cached, {
                headers: { 'X-Cache': 'HIT' }
            })
        }

        const settings = await prisma.pricingSetting.findUnique({
            where: { id: 'default' }
        })

        // Map PricingSetting to the format expected by the frontend
        if (!settings) {
            const fallback = {
                sizeMultiplier: 1.0,
                taxPercentage: 0.0,
                baseFee: 2.5
            }
            await setCachedJson(PRICING_CACHE_KEY, fallback, 60)
            return NextResponse.json(fallback, {
                headers: { 'X-Cache': 'MISS' }
            })
        }

        const payload = {
            sizeMultiplier: settings.scaleMultiplier,
            taxPercentage: settings.taxRate,
            baseFee: settings.serviceFee
        }
        await setCachedJson(PRICING_CACHE_KEY, payload, 60)
        return NextResponse.json(payload, {
            headers: { 'X-Cache': 'MISS' }
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
