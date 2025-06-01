'use client';

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function LogoutButton() {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="mr-2 h-5 w-5" />
      <span>Logout</span>
    </Button>
  );
}
