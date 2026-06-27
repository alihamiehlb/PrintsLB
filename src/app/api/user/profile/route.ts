import { parseJsonBody } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { sanitizeText } from '@/lib/sanitize'

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, password } = await parseJsonBody<{ name?: string; password?: string }>(request)

        const updateData: { name?: string; password?: string } = {}
        if (name) updateData.name = sanitizeText(name)
        if (password) {
            updateData.password = await hashPassword(password)
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData
        })

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email
            }
        })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
