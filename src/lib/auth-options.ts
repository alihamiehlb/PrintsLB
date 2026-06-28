import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'
import { verifyTurnstileToken, isTurnstileConfigured } from '@/lib/turnstile'
import { hasTurnstileClearance } from '@/lib/turnstile-clearance'

export const authOptions: NextAuthOptions = {
  // Remove PrismaAdapter when using JWT strategy to avoid conflicts
  // adapter: PrismaAdapter(prisma),
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
    async signIn({ user, account, profile }) {
      if (!user?.email) {
        return false
      }

      // For Google sign-in, ensure user exists in database
      if (account?.provider === 'google') {
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          })

          if (!dbUser) {
            // Create new user if doesn't exist
            console.log('Creating new user for Google sign-in:', user.email)
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name || 'Google User',
                role: 'USER',
              },
            })
          } else {
            console.log('Found existing user for Google sign-in:', user.email, 'with role:', dbUser.role)
          }

          // Create account record for Google if it doesn't exist
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: dbUser.id,
              provider: 'google',
            },
          })

          if (!existingAccount) {
            console.log('Creating Google account record for user:', dbUser.id)
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

          // Update user object with database role
          user.role = dbUser.role
          user.id = dbUser.id
          console.log('Set user role from DB:', user.role, 'user ID:', user.id)
        } catch (error) {
          console.error('Error in Google signIn callback:', error)
          // Don't block sign-in on database errors
        }
      }

      return true
    },
    async jwt({ token, user, account }) {
      // Initial sign in - add user info to token
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER'
        token.id = user.id
        token.email = user.email
      }

      // For Google provider, we must always get the user from the DB to get their correct role and DB user ID.
      // (The initial `user` object from Google has the Google ID, not the database ID).
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
