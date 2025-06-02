'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedSkeletonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'card' | 'text' | 'circle' | 'chart';
  lines?: number;
}

const skeletonVariants = {
  loading: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function AnimatedSkeleton({ 
  className, 
  children, 
  variant = 'default',
  lines = 3 
}: AnimatedSkeletonProps) {
  if (children) {
    return (
      <motion.div
        className={className}
        variants={skeletonVariants}
        animate="loading"
      >
        {children}
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        className={cn('rounded-lg border bg-card', className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-6 space-y-4">
          <motion.div
            className="h-4 bg-muted rounded w-1/3"
            variants={itemVariants}
          />
          <motion.div
            className="h-16 bg-muted rounded"
            variants={itemVariants}
          />
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'h-3 bg-muted rounded',
                  i === lines - 1 ? 'w-2/3' : 'w-full'
                )}
                variants={itemVariants}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'text') {
    return (
      <motion.div
        className={cn('space-y-2', className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {Array.from({ length: lines }).map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'h-4 bg-muted rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            variants={itemVariants}
          />
        ))}
      </motion.div>
    );
  }

  if (variant === 'circle') {
    return (
      <motion.div
        className={cn('rounded-full bg-muted', className)}
        variants={skeletonVariants}
        animate="loading"
      />
    );
  }

  if (variant === 'chart') {
    return (
      <motion.div
        className={cn('rounded-lg bg-card border p-6', className)}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="h-6 bg-muted rounded w-1/4 mb-4"
          variants={itemVariants}
        />
        <motion.div
          className="h-64 bg-muted rounded"
          variants={itemVariants}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('h-4 bg-muted rounded', className)}
      variants={skeletonVariants}
      animate="loading"
    />
  );
}
