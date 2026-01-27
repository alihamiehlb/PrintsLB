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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Create unique filename
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${orderId}_${timestamp}_${safeName}`
    const filepath = join(uploadsDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filepath, buffer)

    console.log(`File saved: ${filename}`)

    return NextResponse.json({
      success: true,
      filename: filename,
      url: `/uploads/${filename}`,
      message: 'File uploaded successfully'
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
