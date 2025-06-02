'use client';

import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useLazyLoading } from '@/hooks/use-lazy-loading';
import { AnimatedSkeleton } from '@/components/ui/animated-skeleton';
import { cn } from '@/lib/utils';

interface LazyWidgetProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  skeletonVariant?: 'default' | 'card' | 'text' | 'circle' | 'chart';
  threshold?: number;
  rootMargin?: string;
}

const fadeInVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
    }
  },
};

export function LazyWidget({
  children,
  fallback,
  className,
  skeletonVariant = 'card',
  threshold = 0.1,
  rootMargin = '100px',
}: LazyWidgetProps) {
  const { ref, isVisible } = useLazyLoading({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const defaultFallback = (
    <AnimatedSkeleton 
      variant={skeletonVariant}
      className="min-h-[200px]"
    />
  );

  return (
    <div ref={ref} className={cn('w-full', className)}>
      {isVisible ? (
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
        >
          <Suspense fallback={fallback || defaultFallback}>
            {children}
          </Suspense>
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  );
}

// Función helper para crear widgets lazy-loaded
export function createLazyWidget<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallbackVariant: 'card' | 'chart' | 'text' = 'card'
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyWidgetWrapper(props: T & {
    className?: string;
    fallback?: React.ReactNode;
  }) {
    const { className, fallback, ...componentProps } = props;
    
    return (
      <LazyWidget
        className={className}
        fallback={fallback}
        skeletonVariant={fallbackVariant}
      >
        <LazyComponent {...(componentProps as any)} />
      </LazyWidget>
    );
  };
}
