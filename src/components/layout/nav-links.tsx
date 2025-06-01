'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  ListChecks,
  Cpu,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/collaborative-docs', label: 'Docs', icon: FileText },
  { href: '/interactive-calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/task-list', label: 'Tasks', icon: ListChecks },
  { href: '/smart-assist', label: 'Smart Assist', icon: Cpu },
  { href: '/sync', label: 'Sync Status', icon: RefreshCw },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith(item.href)}
              tooltip={item.label}
              className={cn(
                "justify-start",
                pathname.startsWith(item.href) ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <a>
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
