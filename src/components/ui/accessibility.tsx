'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAnnouncement, useFocusManagement, useAccessibilityPreferences } from '@/hooks/use-accessibility';

// Accessible live region for announcements
export const LiveRegion = forwardRef<HTMLDivElement, {
  announcement: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}>(({ announcement, priority = 'polite', className }, ref) => {
  return (
    <div
      ref={ref}
      aria-live={priority}
      aria-atomic="true"
      className={cn('sr-only', className)}
    >
      {announcement}
    </div>
  );
});

LiveRegion.displayName = 'LiveRegion';

// Skip to content link
export function SkipToContent() {
  const skipToMain = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={skipToMain}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:border-2 focus:border-primary-foreground"
    >
      Saltar al contenido principal
    </button>
  );
}

// Accessible modal dialog
export const AccessibleModal = forwardRef<HTMLDivElement, {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}>(({ isOpen, onClose, title, description, children, className }, ref) => {
  const { trapFocus } = useFocusManagement();
  const { announce } = useAnnouncement();
  const modalRef = useRef<HTMLDivElement>(null);
  const preferences = useAccessibilityPreferences();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const cleanup = trapFocus(modalRef.current);
      announce(`Modal abierto: ${title}`);
      
      return cleanup;
    }
  }, [isOpen, trapFocus, announce, title]);

  const animationVariants = preferences.reducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          transition: {
            type: 'spring',
            damping: 25,
            stiffness: 300,
          }
        },
        exit: { 
          opacity: 0, 
          scale: 0.95, 
          y: 20,
          transition: {
            duration: 0.2,
          }
        },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby={description ? "modal-description" : undefined}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          />
          
          {/* Modal content */}
          <motion.div
            ref={modalRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animationVariants}
            className={cn(
              'relative z-10 w-full max-w-md p-6 mx-4 bg-background border rounded-lg shadow-lg',
              className
            )}
          >
            <h2 id="modal-title" className="text-xl font-semibold mb-2">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-muted-foreground mb-4">
                {description}
              </p>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

AccessibleModal.displayName = 'AccessibleModal';

// Enhanced button with accessibility features
export const AccessibleButton = forwardRef<HTMLButtonElement, {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}>(({ 
  variant = 'default', 
  size = 'default', 
  loading = false, 
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  className,
  children,
  onClick,
  ...props 
}, ref) => {
  const { announce } = useAnnouncement();
  const preferences = useAccessibilityPreferences();

  const handleClick = () => {
    if (loading || disabled) return;
    
    if (onClick) {
      onClick();
    }
    
    // Announce action completion for screen readers
    if (ariaLabel) {
      announce(`${ariaLabel} completado`);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
  };

  const motionProps = preferences.reducedMotion 
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      };

  return (
    <motion.button
      ref={ref}
      {...motionProps}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled || loading}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </motion.button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// Progress indicator with accessibility
export const AccessibleProgress = forwardRef<HTMLDivElement, {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}>(({ value, max = 100, label, showValue = false, className }, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const { announce } = useAnnouncement();
  const previousValue = useRef(value);

  useEffect(() => {
    if (value !== previousValue.current) {
      const percentageRounded = Math.round(percentage);
      announce(`${label || 'Progreso'}: ${percentageRounded}%`);
      previousValue.current = value;
    }
  }, [value, percentage, label, announce]);

  return (
    <div 
      ref={ref}
      className={cn('w-full', className)}
    >
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{label}</span>
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="w-full h-2 bg-secondary rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-primary rounded-full"
        />
      </div>
    </div>
  );
});

AccessibleProgress.displayName = 'AccessibleProgress';

// Accessible form field wrapper
export const AccessibleFormField = forwardRef<HTMLDivElement, {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}>(({ label, description, error, required = false, children, className }, ref) => {
  const fieldId = React.useId();
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;

  return (
    <div ref={ref} className={cn('space-y-2', className)}>
      <label 
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="requerido">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': [
            description ? descriptionId : '',
            error ? errorId : '',
          ].filter(Boolean).join(' ') || undefined,
          'aria-invalid': error ? 'true' : undefined,
          required,
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

AccessibleFormField.displayName = 'AccessibleFormField';
