import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'

export const authOptions: NextAuthOptions = {
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
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Verify Turnstile captcha token directly (single-use, sent from client form)
          if (isTurnstileConfigured()) {
            const captcha = await verifyTurnstileToken(credentials.turnstileToken)
            if (!captcha.ok) {
              return null
            }
          }

          // Look up user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
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

          // Return the DB user id, email, name and role
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
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
    // signIn: ensure Google users exist in DB
    async signIn({ user, account, profile }) {
      if (!user?.email) return false

      if (account?.provider === 'google') {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name || 'Google User',
                role: 'USER',
              },
            })
          }

          // Ensure Google account link record exists
          const existingAccount = await prisma.account.findFirst({
            where: { userId: dbUser.id, provider: 'google' },
          })

          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: dbUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
          }
        } catch (error) {
          console.error('Error in Google signIn callback:', error)
          // Don't block sign-in on DB errors
        }
      }

      return true
    },

    // jwt: build the token on first sign-in and on every refresh
    async jwt({ token, user, account }) {
      // ── First sign-in (credentials) ──────────────────────────────────────
      // `user` is populated only on the very first call after authorize()
      if (user && !account) {
        // Credentials provider: user object already has DB id and role
        token.id = user.id
        token.email = user.email ?? token.email
        token.role = (user as { role?: string }).role ?? 'USER'
        return token
      }

      // ── First sign-in (Google) ────────────────────────────────────────────
      // `account` is populated only on the first call after Google OAuth
      if (account?.provider === 'google' && user?.email) {
        token.email = user.email
        // Always read role + id from DB so the token reflects the real DB record
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error fetching DB user in jwt callback (Google):', error)
        }
        return token
      }

      // ── Subsequent requests (token refresh) ────────────────────────────────
      // Neither `user` nor `account` are set. The token already has id/role
      // from the first sign-in. No DB call needed unless role is missing.
      if (!token.role && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
          }
        } catch (error) {
          console.error('Error fetching DB user in jwt callback (refresh):', error)
        }
      }

      return token
    },

    // session: expose id and role to the client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? 'USER'
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
