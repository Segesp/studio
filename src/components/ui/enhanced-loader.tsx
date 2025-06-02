'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spin' | 'pulse' | 'dots' | 'progress' | 'skeleton';
  className?: string;
  text?: string;
  progress?: number; // 0-100 for progress variant
}

export function EnhancedLoader({ 
  size = 'md', 
  variant = 'spin', 
  className,
  text,
  progress = 0
}: EnhancedLoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  if (variant === 'spin') {
    return (
      <motion.div
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Loader2 className={cn('text-primary', sizeClasses[size])} />
        </motion.div>
        <AnimatePresence>
          {text && (
            <motion.p
              className="text-sm text-muted-foreground"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'pulse') {
    return (
      <motion.div
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <motion.div
          className={cn('rounded-full bg-primary', sizeClasses[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <AnimatePresence>
          {text && (
            <motion.p
              className="text-sm text-muted-foreground"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'dots') {
    return (
      <motion.div
        className={cn('flex flex-col items-center justify-center gap-3', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-2 w-2 rounded-full bg-primary"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <AnimatePresence>
          {text && (
            <motion.p
              className="text-sm text-muted-foreground"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'progress') {
    return (
      <motion.div
        className={cn('flex flex-col items-center justify-center gap-3 w-full max-w-xs', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: 0.5,
              ease: "easeOut"
            }}
          />
        </div>
        <AnimatePresence>
          {text && (
            <motion.p
              className="text-sm text-muted-foreground text-center"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {text} {progress > 0 && `(${Math.round(progress)}%)`}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <motion.div
        className={cn('space-y-3', className)}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              'h-4 bg-muted rounded',
              index === 2 ? 'w-3/4' : 'w-full'
            )}
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
        <AnimatePresence>
          {text && (
            <motion.p
              className="text-sm text-muted-foreground"
              variants={textVariants}
              initial="initial"
              animate="animate"
              exit="initial"
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return null;
}
