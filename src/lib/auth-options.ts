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

          // Bypass Turnstile for the admin email to ensure they can always login
          const isAdminBypass = credentials.email.toLowerCase().trim() === 'alihamiehlb@gmail.com'
          
          if (isTurnstileConfigured() && !isAdminBypass) {
            const captcha = await verifyTurnstileToken(credentials.turnstileToken)
            if (!captcha.ok) {
              console.log('Turnstile failed for', credentials.email)
              return null
            }
          }

          // Look up user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          })

          if (!user?.password) {
            console.log('No password found for', credentials.email)
            return null
          }

          const isPasswordValid = await verifyPassword(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('Invalid password for', credentials.email)
            return null
          }

          console.log('Credentials login successful for', user.email, 'Role:', user.role)

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
      console.log('JWT Callback Triggered. Account:', account?.provider, 'User Email:', user?.email, 'Token Email:', token?.email, 'Token Role:', token?.role)
      
      // ── First sign-in (credentials) ──────────────────────────────────────
      if (user && !account) {
        token.id = user.id
        token.email = user.email ?? token.email
        token.role = (user as { role?: string }).role ?? 'USER'
        console.log('JWT: Credentials first sign-in. Set role to:', token.role)
        return token
      }

      // ── First sign-in (Google) ────────────────────────────────────────────
      if (account?.provider === 'google' && user?.email) {
        token.email = user.email
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            console.log('JWT: Google first sign-in. Fetched role from DB:', token.role)
          } else {
            console.log('JWT: Google first sign-in. DB user not found!')
          }
        } catch (error) {
          console.error('Error fetching DB user in jwt callback (Google):', error)
        }
        return token
      }

      // ── Subsequent requests (token refresh) ────────────────────────────────
      if (!token.role && token.email) {
        console.log('JWT: Refresh missing role. Fetching from DB for:', token.email)
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.role = dbUser.role
            console.log('JWT: Refresh fetched role:', token.role)
          }
        } catch (error) {
          console.error('Error fetching DB user in jwt callback (refresh):', error)
        }
      }

      return token
    },

    // session: expose id and role to the client
    async session({ session, token }) {
      console.log('Session Callback. Token Role:', token.role)
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
