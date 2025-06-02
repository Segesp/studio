'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  CheckSquare, 
  Calendar, 
  FileText,
  Clock,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { HoverScale, HoverLift } from '@/components/ui/page-transition';

const quickActions = [
  {
    title: 'Nueva Tarea',
    description: 'Crear una nueva tarea',
    icon: CheckSquare,
    href: '/task-list',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Nuevo Evento',
    description: 'Programar un evento',
    icon: Calendar,
    href: '/interactive-calendar',
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Nuevo Documento',
    description: 'Crear documento colaborativo',
    icon: FileText,
    href: '/collaborative-docs',
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    title: 'Smart Assist',
    description: 'Acceder a asistente IA',
    icon: Zap,
    href: '/smart-assist',
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    iconColor: 'text-purple-600'
  }
];

const shortcuts = [
  {
    title: 'Ver todas las tareas',
    description: 'Gestionar tareas pendientes',
    icon: CheckSquare,
    href: '/task-list',
    badge: null
  },
  {
    title: 'Calendario completo',
    description: 'Ver eventos del mes',
    icon: Calendar,
    href: '/interactive-calendar',
    badge: null
  },
  {
    title: 'Mis documentos',
    description: 'Acceder a documentos',
    icon: FileText,
    href: '/collaborative-docs',
    badge: null
  },
  {
    title: 'Sincronización',
    description: 'Estado de sincronización',
    icon: Clock,
    href: '/sync',
    badge: 'Activo'
  }
];

export function QuickActionsWidget() {
  return (
    <div 
      className="grid grid-cols-1 gap-4 lg:grid-cols-2" 
      role="region" 
      aria-label="Quick actions and navigation panel"
    >
      {/* Acciones Rápidas */}
      <Card role="region" aria-labelledby="quick-actions-title">
        <CardHeader>
          <CardTitle 
            id="quick-actions-title" 
            className="text-lg font-semibold flex items-center"
          >
            <Zap className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
            Acciones Rápidas
          </CardTitle>
          <p 
            className="text-sm text-muted-foreground"
            id="quick-actions-desc"
            aria-describedby="quick-actions-title"
          >
            Crear nuevos elementos rápidamente
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className="grid grid-cols-2 gap-3" 
            role="grid" 
            aria-label="Quick action buttons"
          >
            {quickActions.map((action, index) => (
              <Link key={action.title} href={action.href}>
                <HoverScale scale={1.02}>
                  <div 
                    className={`
                      p-4 rounded-lg border transition-all duration-200 cursor-pointer
                      hover:shadow-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${action.color}
                    `}
                    role="gridcell"
                    tabIndex={0}
                    aria-label={`${action.title}: ${action.description}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.location.href = action.href;
                      }
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`p-2 rounded-full bg-white shadow-sm`}>
                        <action.icon className={`h-5 w-5 ${action.iconColor}`} aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        <p className="text-xs opacity-80 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </div>
                </HoverScale>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navegación Rápida */}
      <Card role="region" aria-labelledby="quick-nav-title">
        <CardHeader>
          <CardTitle 
            id="quick-nav-title" 
            className="text-lg font-semibold flex items-center"
          >
            <ArrowRight className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
            Navegación Rápida
          </CardTitle>
          <p 
            className="text-sm text-muted-foreground"
            id="quick-nav-desc"
            aria-describedby="quick-nav-title"
          >
            Accesos directos a secciones
          </p>
        </CardHeader>
        <CardContent>
          <div 
            className="space-y-3" 
            role="navigation" 
            aria-label="Quick navigation links"
          >
            {shortcuts.map((shortcut, index) => (
              <Link key={shortcut.title} href={shortcut.href}>
                <HoverLift y={-2}>
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                    role="link"
                    tabIndex={0}
                    aria-label={`Navigate to ${shortcut.title}: ${shortcut.description}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.location.href = shortcut.href;
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-md bg-muted group-hover:bg-background transition-colors"
                        aria-hidden="true"
                      >
                        <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{shortcut.title}</h3>
                        <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {shortcut.badge && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          aria-label={`Status: ${shortcut.badge}`}
                        >
                          {shortcut.badge}
                        </Badge>
                      )}
                      <ArrowRight 
                        className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" 
                        aria-hidden="true" 
                      />
                    </div>
                  </div>
                </HoverLift>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
