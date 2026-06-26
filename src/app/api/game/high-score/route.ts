import { NextRequest, NextResponse } from 'next/server'
import { parseJsonBody } from '@/lib/json'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export async function GET() {
    try {
        const highScore = await prisma.highScore.findUnique({
            where: { id: 'global_top' }
        })

        return NextResponse.json(highScore || { score: 0, playerName: 'Anonymous' })
    } catch (error) {
        console.error('Error fetching high score:', error)
        return NextResponse.json({ error: 'Failed to fetch high score' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        const { score } = await parseJsonBody<{ score: number }>(request)

        if (typeof score !== 'number') {
            return NextResponse.json({ error: 'Invalid score' }, { status: 400 })
        }

        const currentTop = await prisma.highScore.findUnique({
            where: { id: 'global_top' }
        })

        if (!currentTop || score > currentTop.score) {
            const playerName = session?.user?.name || 'Anonymous'

            const newTop = await prisma.highScore.upsert({
                where: { id: 'global_top' },
                create: {
                    id: 'global_top',
                    score,
                    playerName
                },
                update: {
                    score,
                    playerName
                }
            })

            return NextResponse.json({ success: true, highScore: newTop })
        }

        return NextResponse.json({ success: false, message: 'Not a new high score' })
    } catch (error) {
        console.error('Error updating high score:', error)
        return NextResponse.json({ error: 'Failed to update high score' }, { status: 500 })
    }
}
