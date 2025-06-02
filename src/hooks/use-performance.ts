'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  timing: {
    domContentLoaded: number;
    loadComplete: number;
    firstContentfulPaint: number;
  };
  bundleSize: number;
  renderTime: number;
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number>();

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        
        // Get memory info if available
        const memory = (performance as any).memory;
        const memoryMetrics = memory ? {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
        } : { used: 0, total: 0, percentage: 0 };

        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const timing = {
          domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
          loadComplete: Math.round(navigation.loadEventEnd - navigation.startTime),
          firstContentfulPaint: 0,
        };

        // Get paint timing
        const paintEntries = performance.getEntriesByType('paint');
        const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          timing.firstContentfulPaint = Math.round(fcpEntry.startTime);
        }

        setMetrics({
          fps,
          memory: memoryMetrics,
          timing,
          bundleSize: 0, // Would need to be calculated separately
          renderTime: 0, // Would need render profiling
        });

        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      if (isMonitoring) {
        animationFrameId.current = requestAnimationFrame(measureFPS);
      }
    };

    measureFPS();
  }, [isMonitoring]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  };
}

// Bundle analyzer hook
export function useBundleAnalysis() {
  const [bundleInfo, setBundleInfo] = useState<{
    totalSize: number;
    gzippedSize: number;
    modules: Array<{ name: string; size: number }>;
  } | null>(null);

  const analyzeBundleSize = useCallback(async () => {
    try {
      // This would typically integrate with webpack-bundle-analyzer
      // For now, we'll provide estimated sizes
      const response = await fetch('/_next/static/chunks/main.js', { method: 'HEAD' });
      const contentLength = response.headers.get('content-length');
      
      setBundleInfo({
        totalSize: contentLength ? parseInt(contentLength) : 0,
        gzippedSize: 0,
        modules: [],
      });
    } catch (error) {
      console.warn('Bundle analysis failed:', error);
    }
  }, []);

  return {
    bundleInfo,
    analyzeBundleSize,
  };
}

// Component render profiler
export function useRenderProfiler(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef<number>();
  const totalRenderTime = useRef(0);

  useEffect(() => {
    startTime.current = performance.now();
    renderCount.current++;
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        totalRenderTime.current += renderTime;
        
        // Log performance data in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
          console.log(`${componentName} average render time: ${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`);
        }
      }
    };
  });

  return {
    renderCount: renderCount.current,
    averageRenderTime: renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0,
  };
}

// Memory leak detector
export function useMemoryLeakDetector() {
  const [memoryTrend, setMemoryTrend] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startDetection = useCallback(() => {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        setMemoryTrend(prev => {
          const newTrend = [...prev, usedMB].slice(-20); // Keep last 20 measurements
          
          // Detect potential memory leak (consistent growth over time)
          if (newTrend.length >= 10) {
            const recent = newTrend.slice(-5);
            const earlier = newTrend.slice(-10, -5);
            const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
            const earlierAvg = earlier.reduce((a, b) => a + b) / earlier.length;
            
            if (recentAvg > earlierAvg * 1.2) {
              console.warn('Potential memory leak detected:', {
                recentAverage: recentAvg.toFixed(2),
                earlierAverage: earlierAvg.toFixed(2),
                trend: newTrend,
              });
            }
          }
          
          return newTrend;
        });
      }
    };

    intervalRef.current = setInterval(checkMemory, 5000); // Check every 5 seconds
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    memoryTrend,
    startDetection,
    stopDetection,
  };
}

// Performance optimization suggestions
export function usePerformanceOptimizations() {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const analyzePerformance = useCallback((metrics: PerformanceMetrics) => {
    const newSuggestions: string[] = [];

    if (metrics.fps < 30) {
      newSuggestions.push('FPS bajo detectado. Considera reducir animaciones o usar will-change CSS.');
    }

    if (metrics.memory.percentage > 80) {
      newSuggestions.push('Alto uso de memoria detectado. Revisa memory leaks o components no limpiados.');
    }

    if (metrics.timing.firstContentfulPaint > 2000) {
      newSuggestions.push('First Contentful Paint lento. Considera code splitting o lazy loading.');
    }

    if (metrics.timing.domContentLoaded > 3000) {
      newSuggestions.push('DOM Content Loaded lento. Optimiza el bundle size o usa prefetch.');
    }

    setSuggestions(newSuggestions);
  }, []);

  return {
    suggestions,
    analyzePerformance,
  };
}

// Web Vitals monitoring
export function useWebVitals() {
  const [vitals, setVitals] = useState<{
    CLS: number;
    FCP: number;
    FID: number;
    LCP: number;
    TTFB: number;
  } | null>(null);

  useEffect(() => {
    // This would integrate with web-vitals library
    // For now, we'll use performance API directly
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          setVitals(prev => ({ ...prev, LCP: entry.startTime } as any));
        }
        if (entry.entryType === 'first-input') {
          const fidEntry = entry as PerformanceEventTiming;
          setVitals(prev => ({ ...prev, FID: fidEntry.processingStart - fidEntry.startTime } as any));
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });

    // Get navigation timing for TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart;
      setVitals(prev => ({ ...prev, TTFB: ttfb } as any));
    }

    return () => observer.disconnect();
  }, []);

  return vitals;
}
