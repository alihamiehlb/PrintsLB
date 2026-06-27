import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'
import { hasTurnstileClearance } from '@/lib/turnstile-clearance'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  get providers() {
    return [
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? [
            GoogleProvider({
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              allowDangerousEmailAccountLinking: true,
            }),
          ]
        : []),
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
          turnstileToken: { label: 'Turnstile', type: 'text' },
        },
        async authorize(credentials, request) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          if (
            isTurnstileConfigured() &&
            !(await hasTurnstileClearance(request))
          ) {
            const captcha = await verifyTurnstileToken(credentials.turnstileToken)
            if (!captcha.ok) {
              return null
            }
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user?.password) {
            return null
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        },
      }),
    ]
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        return false
      }

      // Allow all Google sign-ins - the adapter will handle user creation/account linking
      if (account?.provider === 'google') {
        return true
      }

      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in - add user info to token
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER'
        token.id = user.id
      }

      // For Google provider, ensure we have the latest user data from DB
      if (account?.provider === 'google' && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.id = dbUser.id
          }
        } catch (error) {
          console.error('Error fetching user in JWT callback:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? 'USER'
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  get secret() {
    return process.env.NEXTAUTH_SECRET
  },
}
