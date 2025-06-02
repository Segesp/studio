'use client';

import { motion, useAnimation, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MicroInteractionProps {
  children: React.ReactNode;
  type?: 'hover' | 'tap' | 'focus' | 'scroll' | 'magnetic' | 'floating';
  className?: string;
  disabled?: boolean;
}

// Hover micro-interaction
export function HoverInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  return (
    <motion.div
      className={cn('cursor-pointer', className)}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
    >
      {children}
    </motion.div>
  );
}

// Tap/Click micro-interaction
export function TapInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  return (
    <motion.div
      className={cn('cursor-pointer select-none', className)}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1, ease: "easeInOut" }
      }}
      animate={{
        scale: 1,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
    >
      {children}
    </motion.div>
  );
}

// Focus micro-interaction
export function FocusInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  return (
    <motion.div
      className={cn('outline-none', className)}
      whileFocus={{
        scale: 1.02,
        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)",
        transition: { duration: 0.2 }
      }}
      tabIndex={0}
    >
      {children}
    </motion.div>
  );
}

// Scroll-triggered animation
export function ScrollInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: "-100px" 
  });

  if (disabled) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1]
        }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

// Magnetic interaction (follows cursor)
export function MagneticInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 100;
      
      if (distance < maxDistance) {
        const strength = 1 - distance / maxDistance;
        const moveX = deltaX * strength * 0.3;
        const moveY = deltaY * strength * 0.3;
        
        controls.start({
          x: moveX,
          y: moveY,
          transition: { duration: 0.3, ease: "easeOut" }
        });
      }
    };

    const handleMouseLeave = () => {
      controls.start({
        x: 0,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" }
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [controls, disabled]);

  if (disabled) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      className={cn('cursor-pointer', className)}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}

// Floating animation
export function FloatingInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -8, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Ripple effect
export function RippleInteraction({ 
  children, 
  className,
  disabled = false 
}: MicroInteractionProps) {
  if (disabled) return <>{children}</>;

  return (
    <motion.div
      className={cn('relative overflow-hidden', className)}
      whileTap={{
        scale: 0.98,
      }}
      onTap={(event, info) => {
        // Create ripple effect here if needed
        console.log('Ripple at:', info.point);
      }}
    >
      {children}
    </motion.div>
  );
}

// Combined interaction wrapper
export function MicroInteraction({ 
  children, 
  type = 'hover', 
  className,
  disabled = false 
}: MicroInteractionProps) {
  switch (type) {
    case 'hover':
      return (
        <HoverInteraction className={className} disabled={disabled}>
          {children}
        </HoverInteraction>
      );
    case 'tap':
      return (
        <TapInteraction className={className} disabled={disabled}>
          {children}
        </TapInteraction>
      );
    case 'focus':
      return (
        <FocusInteraction className={className} disabled={disabled}>
          {children}
        </FocusInteraction>
      );
    case 'scroll':
      return (
        <ScrollInteraction className={className} disabled={disabled}>
          {children}
        </ScrollInteraction>
      );
    case 'magnetic':
      return (
        <MagneticInteraction className={className} disabled={disabled}>
          {children}
        </MagneticInteraction>
      );
    case 'floating':
      return (
        <FloatingInteraction className={className} disabled={disabled}>
          {children}
        </FloatingInteraction>
      );
    default:
      return <>{children}</>;
  }
}
