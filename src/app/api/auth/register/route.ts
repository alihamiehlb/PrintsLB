import { parseJsonBody } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'
import { getClientIp } from '@/lib/rate-limit'
import {
  createTurnstileClearance,
  hasTurnstileClearance,
  TURNSTILE_CLEARANCE_COOKIE,
  TURNSTILE_CLEARANCE_TTL_MS,
} from '@/lib/turnstile-clearance'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, turnstileToken } = await parseJsonBody<{
      name: string
      email: string
      password: string
      turnstileToken?: string
    }>(request)

    if (isTurnstileConfigured()) {
      const captcha = await verifyTurnstileToken(
        turnstileToken,
        getClientIp(request.headers)
      )
      if (!captcha.ok) {
        return NextResponse.json({ error: captcha.error }, { status: 400 })
      }
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    const response = NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    )

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
