'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface SessionProviderWrapperProps {
  children: ReactNode;
  session?: Session | null; // Make session optional as it might not always be passed
}

export function SessionProviderWrapper({ children, session }: SessionProviderWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
