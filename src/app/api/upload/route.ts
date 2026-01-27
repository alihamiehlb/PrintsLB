import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds is the max for Vercel hobby plan

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    // Optional orderId, if not provided we just use 'temp'
    const orderId: string = (data.get('orderId') as string) || 'temp'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Check file size (Vercel payload limit is 4.5MB)
    const MAX_SIZE = 4.5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 4.5MB platform limit' }, { status: 400 })
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.stl')) {
      return NextResponse.json({ error: 'Only STL files are allowed' }, { status: 400 })
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${orderId}_${timestamp}_${safeName}`

    // Send to Telegram (Crucial for Vercel delivery)
    try {
      const { TelegramService } = await import('@/lib/telegram')
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
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
      // We don't fail the response here if the file is logged, 
      // but in production we want this to be robust.
    }

    return NextResponse.json({
      success: true,
      filename: filename,
      url: '#', // No longer stored locally
      message: 'File processed and sent to Telegram (Cloud Storage)'
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file: ' + error.message }, { status: 500 })
  }
}
