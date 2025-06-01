
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // Adjusted path

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john.doe@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This is a placeholder for development.
        // In a real application, you would validate credentials against your database.
        // For example, find a user by email and verify the password.
        // const user = await prisma.user.findUnique({ where: { email: credentials?.email } });
        // if (user && user.password === credentials.password) { // Hash passwords in production!
        //   return { id: user.id, name: user.name, email: user.email, image: user.image };
        // }
        // For now, let's allow any credentials for demo purposes if GITHUB_ID is not set
        if (!process.env.GITHUB_ID && credentials?.email) {
           const user = await prisma.user.upsert({
            where: { email: credentials.email },
            update: { name: credentials.email.split('@')[0] },
            create: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
            },
          });
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // Add id to session user object
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/api/auth/signin', // Default NextAuth sign-in page
    // signOut: '/auth/signout', // Default
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (e.g. check your email)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
};

export default NextAuth(authOptions);
