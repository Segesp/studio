import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SessionProviderWrapper } from '@/components/layout/session-provider-wrapper';
// import { getServerSession } from 'next-auth/next'; // Not needed here for App Router root layout
// import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Not needed here

export const metadata: Metadata = {
  title: 'Synergy Suite',
  description: 'Collaborate, Organize, Achieve.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // For App Router, SessionProvider typically wraps the client-side part
  // or is used in a client component. We'll pass the session if available
  // but SessionProvider itself handles fetching on the client.
  // const session = await getServerSession(authOptions); // This would make the root layout dynamic

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SessionProviderWrapper>
          <SidebarProvider defaultOpen={true}>
            {children}
          </SidebarProvider>
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
