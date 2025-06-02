'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedChartProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

// Chart container with staggered animations
export function AnimatedChart({ 
  children, 
  className,
  delay = 0,
  duration = 0.8 
}: AnimatedChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: delay / 1000,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: 20 
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <motion.div variants={itemVariants}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// Animated bar for bar charts
export function AnimatedBar({ 
  height, 
  width = "100%", 
  delay = 0,
  className = "",
  color = "hsl(var(--primary))"
}: {
  height: number;
  width?: string | number;
  delay?: number;
  className?: string;
  color?: string;
}) {
  return (
    <motion.div
      className={className}
      style={{ 
        width,
        backgroundColor: color,
        borderRadius: '4px 4px 0 0'
      }}
      initial={{ height: 0 }}
      animate={{ height }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
    />
  );
}

// Animated progress ring
export function AnimatedProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className = "",
  delay = 0
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  delay?: number;
}) {
  const center = size / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={className}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 1.5,
            delay,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
      </svg>
      
      {/* Progress text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: delay + 0.8,
          ease: "easeOut"
        }}
      >
        <span className="text-2xl font-bold text-foreground">
          {Math.round(progress)}%
        </span>
      </motion.div>
    </div>
  );
}

// Animated line path for line charts
export function AnimatedLinePath({
  pathData,
  strokeColor = "hsl(var(--primary))",
  strokeWidth = 2,
  delay = 0,
  className = ""
}: {
  pathData: string;
  strokeColor?: string;
  strokeWidth?: number;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.path
      d={pathData}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{
        pathLength: { 
          duration: 1.5, 
          delay,
          ease: [0.25, 0.1, 0.25, 1] 
        },
        opacity: { 
          duration: 0.3, 
          delay 
        }
      }}
    />
  );
}

// Animated number counter
export function AnimatedCounter({
  value,
  duration = 1,
  delay = 0,
  formatValue = (val: number) => Math.round(val).toString(),
  className = ""
}: {
  value: number;
  duration?: number;
  delay?: number;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      let startValue = 0;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (value - startValue) * easeOut;
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, duration, delay]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {formatValue(displayValue)}
    </motion.span>
  );
}

// Pulse effect for data points
export function DataPointPulse({
  children,
  intensity = 1,
  delay = 0
}: {
  children: React.ReactNode;
  intensity?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
      }}
      transition={{
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
      whileHover={{
        scale: 1 + (0.1 * intensity),
        transition: { duration: 0.2 }
      }}
    >
      <motion.div
        animate={{
          boxShadow: [
            `0 0 0 0 hsl(var(--primary) / 0.4)`,
            `0 0 0 ${10 * intensity}px hsl(var(--primary) / 0)`,
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
