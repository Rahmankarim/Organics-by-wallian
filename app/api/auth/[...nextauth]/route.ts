import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
// Dynamic import - will be loaded at runtime
import { User } from '@/lib/mongoose'
import { verifyPassword } from '@/lib/auth'
import dbConnect from '@/lib/mongoose'

// Use the cached MongoDB client from lib/mongodb.ts to avoid connection pool exhaustion
import clientPromise from '@/lib/mongodb'

export const authOptions: AuthOptions = {
  adapter: process.env.MONGODB_URI ? MongoDBAdapter(clientPromise) : undefined,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        await dbConnect()

        // Find user by email
        const user = await User.findOne({ email: credentials.email.toLowerCase() })

        if (!user) {
          throw new Error('Invalid email or password')
        }

        // Verify password
        const isPasswordValid = await verifyPassword(credentials.password, user.password!)

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
          throw new Error('Please verify your email before logging in')
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() })

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          emailVerified: user.isEmailVerified,
          image: user.avatar
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Store additional user info in token
      if (user) {
        token.role = (user as any).role
        token.emailVerified = (user as any).emailVerified
      }

      // Handle OAuth sign-in
      if (account && account.provider !== 'credentials') {
        await dbConnect()

        // Check if user exists in our database
        let dbUser = await User.findOne({ email: token.email })

        if (!dbUser) {
          // Create new user for OAuth
          const nameParts = token.name?.split(' ') || ['', '']
          dbUser = await User.create({
            email: token.email,
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(' ') || '',
            avatar: token.picture,
            isEmailVerified: true, // OAuth emails are pre-verified
            role: 'customer',
            preferences: {}
          })
        } else {
          // Update last login and avatar
          await User.findByIdAndUpdate(dbUser._id, {
            lastLogin: new Date(),
            avatar: token.picture || dbUser.avatar
          })
        }

        token.role = dbUser.role
        token.emailVerified = dbUser.isEmailVerified
      }

      return token
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (session.user) {
        (session.user as any).id = token.sub
          ; (session.user as any).role = token.role
          ; (session.user as any).emailVerified = token.emailVerified
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow OAuth sign-ins
      if (account?.provider !== 'credentials') {
        return true
      }

      // For credentials, user is already validated in authorize
      return true
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/auth/error',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Track sign-in events
      console.log(`User ${user.email} signed in via ${account?.provider}`)
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
