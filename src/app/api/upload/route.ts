import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    // Optional orderId, if not provided we just return the URL for later attachment
    const orderId: string = (data.get('orderId') as string) || 'temp'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (additional server-side check)
    const MAX_SIZE = 50 * 1024 * 1024 // 50MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.stl')) {
      return NextResponse.json({ error: 'Only STL files are allowed' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()

    // Try to save locally (will fail on Vercel, but that's okay)
    let localUrl = ''
    let filename = ''
    try {
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      filename = `${orderId}_${timestamp}_${safeName}`
      const filepath = join(uploadsDir, filename)
      await writeFile(filepath, buffer)
      localUrl = `/uploads/${filename}`
      console.log(`File saved locally: ${filename}`)
    } catch (fsError: any) {
      console.warn('Local filesystem write skipped (expected on Vercel):', fsError.message)
      // Fallback filename for response if local save fails
      filename = `${orderId}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    }

    // Send to Telegram (Crucial for Vercel delivery)
    try {
      const { TelegramService } = await import('@/lib/telegram')
      const userEmailRaw = data.get('userEmail') as string || 'Unknown'

      // Escape for Markdown
      const userEmail = TelegramService.escapeMarkdown(userEmailRaw)
      const safeOrderId = TelegramService.escapeMarkdown(orderId)
      const safeFileName = TelegramService.escapeMarkdown(file.name)

      const caption = `📂 *New File Upload*\n\n👤 *User:* ${userEmail}\n🆔 *Order Reference:* ${safeOrderId}\n📄 *Filename:* ${safeFileName}\n⚖️ *Size:* ${(file.size / 1024 / 1024).toFixed(2)} MB`

      await TelegramService.sendDocument(buffer, file.name, caption)
      console.log('File sent to Telegram successfully')
    } catch (tgError) {
      console.error('Failed to send to Telegram:', tgError)
    }

    return NextResponse.json({
      success: true,
      filename: filename,
      url: localUrl || '#',
      message: localUrl ? 'File saved and sent' : 'Sent to Telegram (Cloud)'
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    // Basic path traversal protection
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const filepath = join(process.cwd(), 'public', 'uploads', filename)

    // In a real app, you might check if file exists or check permissions

    return NextResponse.json({
      url: `/uploads/${filename}`,
      message: 'File found'
    })

  } catch (error: any) {
    console.error('File retrieval error:', error)
    return NextResponse.json({ error: 'Failed to retrieve file: ' + error.message }, { status: 500 })
  }
}
