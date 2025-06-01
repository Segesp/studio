'use client';

import { useWebSocketContext } from '@/components/providers/websocket-provider';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConnectionStatus({ className, showLabel = true, size = 'md' }: ConnectionStatusProps) {
  const { connected, connecting, error } = useWebSocketContext();

  const getStatusInfo = () => {
    if (connecting) {
      return {
        icon: Loader2,
        label: 'Connecting...',
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 border-yellow-200',
      };
    }
    
    if (error) {
      return {
        icon: AlertCircle,
        label: 'Connection Error',
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
      };
    }
    
    if (connected) {
      return {
        icon: Wifi,
        label: 'Connected',
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
      };
    }
    
    return {
      icon: WifiOff,
      label: 'Offline',
      variant: 'secondary' as const,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-200',
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  const content = (
    <Badge 
      variant={statusInfo.variant}
      className={cn(
        'flex items-center gap-1.5 font-medium',
        statusInfo.bgColor,
        className
      )}
    >
      <Icon 
        className={cn(
          iconSize,
          statusInfo.color,
          connecting && 'animate-spin'
        )} 
      />
      {showLabel && (
        <span className={statusInfo.color}>
          {statusInfo.label}
        </span>
      )}
    </Badge>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusInfo.label}</p>
            {error && <p className="text-xs text-muted-foreground mt-1">{error}</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

// Componente simple solo con el icono
export function ConnectionStatusIcon({ className }: { className?: string }) {
  return (
    <ConnectionStatus 
      className={className}
      showLabel={false}
      size="sm"
    />
  );
}
