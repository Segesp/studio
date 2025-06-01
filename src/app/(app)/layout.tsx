import type { ReactNode } from 'react';
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
import { LogOut } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsible="icon" side="left" variant="sidebar">
        <SidebarRail />
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
             <Link href="/dashboard" className="font-headline text-2xl font-semibold text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors">
                Synergy Suite
             </Link>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          <NavLinks />
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="mr-2 h-5 w-5" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex-1 bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md md:justify-end">
           <div className="md:hidden"> {/* Placeholder for potential breadcrumbs or page title on mobile */} </div>
           <SidebarTrigger className="hidden md:flex" />
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

// Need to import Link for the logo
import Link from 'next/link';
