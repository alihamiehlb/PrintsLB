import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getCloudflareEnv, getPublicImageUrl } from '@/lib/cloudflare'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']

function sanitizeKey(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 200)
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const webpFile = formData.get('webp') as File | null

    if (!file && !webpFile) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const uploadFile = webpFile || file!
    if (uploadFile.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 5MB limit' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(uploadFile.type) && !webpFile) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 })
    }

    const timestamp = Date.now()
    const baseName = sanitizeKey(uploadFile.name.replace(/\.[^.]+$/, ''))
    const key = `images/${timestamp}_${baseName}.webp`

    const bytes = await uploadFile.arrayBuffer()
    const cfEnv = getCloudflareEnv()

    if (cfEnv?.IMAGES) {
      await cfEnv.IMAGES.put(key, bytes, {
        httpMetadata: { contentType: 'image/webp' },
      })
    } else if (process.env.NODE_ENV === 'development') {
      // Local dev fallback — store path reference only
      const { writeFile, mkdir } = await import('fs/promises')
      const { join } = await import('path')
      const dir = join(process.cwd(), 'public', 'uploads')
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, `${timestamp}_${baseName}.webp`), Buffer.from(bytes))
    } else {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 503 })
    }

    const url = cfEnv
      ? getPublicImageUrl(key)
      : `/uploads/${timestamp}_${baseName}.webp`

    return NextResponse.json({
      success: true,
      key,
      url,
      webpUrl: url,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key?: string }> }
) {
  // Served via /api/images/[key] route
  return NextResponse.json({ error: 'Use /api/images/[key]' }, { status: 404 })
}
