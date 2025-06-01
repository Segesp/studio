import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Adjusted path
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { NavLinks } from '@/components/layout/nav-links';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { LogoutButton } from '@/components/layout/logout-button'; // We'll create this client component

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/dashboard'); // Redirect to NextAuth's default sign-in page
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <SidebarRail />
        <SidebarHeader className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="font-headline text-2xl font-semibold text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
                  Synergy Suite
              </Link>
              <SidebarTrigger className="md:hidden" />
            </div>
            {session?.user && (
              <div className="flex items-center space-x-2 text-sm text-sidebar-foreground/80 overflow-hidden">
                <UserCircle className="h-5 w-5 shrink-0" />
                <span className="truncate" title={session.user.email ?? session.user.name ?? 'User'}>
                  {session.user.name || session.user.email}
                </span>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <NavLinks />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <LogoutButton />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex-1 bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md md:justify-end">
           <div className="md:hidden"> </div>
           <SidebarTrigger className="hidden md:flex" />
        </header>
        <main className="flex-1 p-6">
          <Suspense fallback={
            <div className="flex h-[calc(100vh-12rem)] w-full items-center justify-center">
              <Loader size={48} />
            </div>
          }>
            {children}
          </Suspense>
        </main>
      </SidebarInset>
    </div>
  );
}
