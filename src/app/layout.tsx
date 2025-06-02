import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { SessionProviderWrapper } from '@/components/layout/session-provider-wrapper';
import { WebSocketProvider } from '@/components/providers/websocket-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { IntlProvider } from 'react-intl';
import Script from 'next/script';
// import { getServerSession } from 'next-auth/next'; // Not needed here for App Router root layout
// import { authOptions } from '@/pages/api/auth/[...nextauth]'; // Not needed here

export const metadata: Metadata = {
  title: 'Synergy Suite',
  description: 'Collaborate, Organize, Achieve.',
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const locale = params.locale;
  const messages = (await import(`../locales/${locale}.json`)).default;

  return (
    <html lang="en">
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function() {
              try {
                const theme = window.localStorage.getItem('theme');
                if (theme) document.documentElement.classList.add(theme);
              } catch (e) {}
            })();`}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            <QueryProvider>
              <WebSocketProvider>
                <SidebarProvider defaultOpen={true}>
                  <IntlProvider locale={locale} messages={messages} defaultLocale="es">
                    {children}
                  </IntlProvider>
                </SidebarProvider>
              </WebSocketProvider>
            </QueryProvider>
            <Toaster />
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
