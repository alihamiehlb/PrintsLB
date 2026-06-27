import { parseJsonBody } from '@/lib/json'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize'

export async function POST(request: NextRequest) {
  try {
    const data = await parseJsonBody<{
      name: string
      email: string
      phone?: string
      service?: string
      message: string
    }>(request)

    // Sanitize inputs
    const name = sanitizeText(data.name || '')
    const email = sanitizeEmail(data.email || '')
    const phone = sanitizeText(data.phone || '')
    const service = sanitizeText(data.service || '')
    const message = sanitizeText(data.message || '')

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('Contact form submission:', {
      name,
      email,
      phone,
      service,
      message,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
