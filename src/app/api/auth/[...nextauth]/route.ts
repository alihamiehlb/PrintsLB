import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import type { NextRequest } from 'next/server'

const handler = (req: NextRequest, ctx: any) => NextAuth(req, ctx, authOptions)

export { handler as GET, handler as POST }
