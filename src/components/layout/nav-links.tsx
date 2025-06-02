'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  FileText,
  CalendarDays,
  ListChecks,
  RefreshCw,
  Shield,
  CalendarClock,
  ListFilter,
  BellPlus,
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
  labelKey: string;
  icon: LucideIcon;
  isSmartAssist?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { href: '/collaborative-docs', labelKey: 'docs', icon: FileText },
  { href: '/interactive-calendar', labelKey: 'calendar', icon: CalendarDays },
  { href: '/task-list', labelKey: 'tasks', icon: ListChecks },
  { href: '/smart-assist/event-scheduling', labelKey: 'eventScheduling', icon: CalendarClock, isSmartAssist: true },
  { href: '/smart-assist/task-prioritization', labelKey: 'taskPrioritization', icon: ListFilter, isSmartAssist: true },
  { href: '/smart-assist/deadline-reminders', labelKey: 'deadlineReminders', icon: BellPlus, isSmartAssist: true },
  { href: '/smart-assist/admin', labelKey: 'admin', icon: Shield, isSmartAssist: true },
  { href: '/sync', labelKey: 'sync', icon: RefreshCw },
];

export function NavLinks() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  // Group Smart Assist items for the main "Smart Assist" link highlighting
  const isSmartAssistPath = pathname?.startsWith('/smart-assist') ?? false;

  return (
    <SidebarMenu role="navigation" aria-label="Main navigation">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              isActive={item.isSmartAssist ? (isSmartAssistPath && pathname?.startsWith(item.href)) : pathname?.startsWith(item.href)}
              tooltip={item.labelKey}
              className={cn(
                "justify-start",
                (item.isSmartAssist ? (isSmartAssistPath && pathname?.startsWith(item.href)) : pathname?.startsWith(item.href))
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <a
                aria-label={
                  `Navigate to ${t(item.labelKey)}`
                }
                aria-current={
                  (item.isSmartAssist ? (isSmartAssistPath && pathname?.startsWith(item.href)) : pathname?.startsWith(item.href))
                    ? 'page'
                    : undefined
                }
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                <span>{t(item.labelKey)}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
