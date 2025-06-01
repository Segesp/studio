
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma'; // Adjusted path

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Solo incluir GitHub si las credenciales están configuradas
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      })
    ] : []),
    CredentialsProvider({
      name: 'Demo Login',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email', 
          placeholder: 'demo@example.com' 
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'demo' 
        },
      },
      async authorize(credentials) {
        try {
          // Para desarrollo: permitir login con demo@example.com / demo
          if (credentials?.email === 'demo@example.com' && credentials?.password === 'demo') {
            const user = await prisma.user.upsert({
              where: { email: 'demo@example.com' },
              update: { 
                name: 'Usuario Demo',
                // Actualizar último acceso
                updatedAt: new Date()
              },
              create: {
                email: 'demo@example.com',
                name: 'Usuario Demo',
              },
            });
            
            return { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              image: user.image 
            };
          }
          
          // Para cualquier otro email, crear/actualizar usuario automáticamente en desarrollo
          if (credentials?.email && process.env.NODE_ENV === 'development') {
            const user = await prisma.user.upsert({
              where: { email: credentials.email },
              update: { 
                name: credentials.email.split('@')[0],
                updatedAt: new Date()
              },
              create: {
                email: credentials.email,
                name: credentials.email.split('@')[0],
              },
            });
            
            return { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              image: user.image 
            };
          }
          
          return null;
        } catch (error) {
          console.error('Error durante autorización:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Asegurar redirecciones seguras
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl + "/dashboard";
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
