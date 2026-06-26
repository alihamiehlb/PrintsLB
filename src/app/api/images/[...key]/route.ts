import { NextRequest, NextResponse } from 'next/server'
import { getCloudflareEnv } from '@/lib/cloudflare'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: keyParts } = await params
  const decodedKey = keyParts.map(decodeURIComponent).join('/')

  if (decodedKey.includes('..') || decodedKey.startsWith('/')) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  const cfEnv = getCloudflareEnv()
  if (!cfEnv?.IMAGES) {
    return NextResponse.json({ error: 'Storage not available' }, { status: 503 })
  }

  const object = await cfEnv.IMAGES.get(decodedKey)
  if (!object) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const headers = new Headers()
  headers.set('Content-Type', object.httpMetadata?.contentType || 'image/webp')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new NextResponse(object.body, { headers })
}
