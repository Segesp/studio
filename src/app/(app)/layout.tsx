import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic';
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
import { Loader } from '@/components/ui/loader';
import { UserCircle } from 'lucide-react';
import { LogoutButton } from '@/components/layout/logout-button';
import { RealtimeNotifications } from '@/components/sync/realtime-notifications';
import { ThemeToggle } from '@/components/theme/theme-toggle';

export default async function AppLayout({ children }: { children: ReactNode }) {
  let session;
  
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error("Error crítico obteniendo sesión en AppLayout:", error);
    // Error crítico del sistema de autenticación o BD caída
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-4">
        <div className="text-center p-8 rounded-lg border shadow-xl bg-card max-w-md">
          <h1 className="text-3xl font-headline font-bold text-destructive mb-4">
            Aplicación No Disponible
          </h1>
          <p className="text-lg text-muted-foreground mb-3">
            Experimentamos dificultades técnicas y no podemos cargar los datos de sesión del usuario.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Verifica que tu base de datos esté ejecutándose y las variables de entorno 
            (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL) estén configuradas correctamente.
          </p>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Ir a la página de inicio
          </Link>
        </div>
      </div>
    );
  }

  // Si no hay sesión, redirigir usando NextAuth
  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <>
      {/* Skip Navigation Links for Accessibility */}
      <a href="#main-content" className="skip-nav">
        Ir al contenido principal
      </a>
      <a href="#sidebar-nav" className="skip-nav">
        Ir a la navegación
      </a>
      
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" side="left" variant="sidebar">
          <SidebarRail />
          <SidebarHeader className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Link 
                  href="/dashboard" 
                  className="font-headline text-2xl font-semibold text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors"
                  aria-label="Synergy Suite - Go to dashboard"
                >
                    Synergy Suite
                </Link>
                <SidebarTrigger 
                  className="md:hidden" 
                  aria-label="Toggle navigation menu"
                />
              </div>
              {session?.user && (
                <div 
                  className="flex items-center space-x-2 text-sm text-sidebar-foreground/80 overflow-hidden"
                  aria-label={`Logged in as ${session.user.name || session.user.email}`}
                >
                  <UserCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="truncate" title={session.user.email ?? session.user.name ?? 'User'}>
                    {session.user.name || session.user.email}
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="flex-1 p-2" id="sidebar-nav">
            <NavLinks />
          </SidebarContent>
          <SidebarFooter className="p-4">
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 bg-background">
          <header 
            className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md md:justify-end"
            role="banner"
          >
             <div className="md:hidden" aria-hidden="true"> </div>
             <div 
               className="flex items-center space-x-4"
               role="toolbar"
               aria-label="Theme and notifications toolbar"
             >
               <ThemeToggle />
               <RealtimeNotifications />
               <SidebarTrigger 
                 className="hidden md:flex" 
                 aria-label="Toggle navigation sidebar"
               />
             </div>
          </header>
          <main 
            id="main-content" 
            className="flex-1 p-6"
            role="main"
            aria-label="Main application content"
          >
            <Suspense fallback={
              <div 
                className="flex h-[calc(100vh-12rem)] w-full items-center justify-center"
                role="status"
                aria-label="Loading main content"
              >
                <Loader size={48} />
                <span className="sr-only">Cargando contenido principal...</span>
              </div>
            }>
              {children}
            </Suspense>
          </main>
        </SidebarInset>
      </div>
    </>
  );
}
