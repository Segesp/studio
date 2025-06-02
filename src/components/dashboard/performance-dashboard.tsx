'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Gauge
} from 'lucide-react';
import { 
  usePerformanceMonitoring, 
  useBundleAnalysis, 
  useMemoryLeakDetector,
  usePerformanceOptimizations,
  useWebVitals
} from '@/hooks/use-performance';

export function PerformanceDashboard() {
  const { metrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitoring();
  const { bundleInfo, analyzeBundleSize } = useBundleAnalysis();
  const { memoryTrend, startDetection, stopDetection } = useMemoryLeakDetector();
  const { suggestions, analyzePerformance } = usePerformanceOptimizations();
  const vitals = useWebVitals();

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (metrics) {
      analyzePerformance(metrics);
    }
  }, [metrics, analyzePerformance]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    startMonitoring();
    startDetection();
    await analyzeBundleSize();
    setIsAnalyzing(false);
  };

  const handleStopAnalysis = () => {
    stopMonitoring();
    stopDetection();
  };

  const getPerformanceScore = () => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // FPS penalty
    if (metrics.fps < 60) score -= (60 - metrics.fps) * 0.5;
    if (metrics.fps < 30) score -= 20;
    
    // Memory penalty
    if (metrics.memory.percentage > 80) score -= 15;
    if (metrics.memory.percentage > 90) score -= 25;
    
    // Timing penalties
    if (metrics.timing.firstContentfulPaint > 2000) score -= 10;
    if (metrics.timing.firstContentfulPaint > 4000) score -= 20;
    
    return Math.max(0, Math.round(score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: 'Excelente' };
    if (score >= 70) return { variant: 'secondary' as const, label: 'Bueno' };
    return { variant: 'destructive' as const, label: 'Necesita mejoras' };
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const performanceScore = getPerformanceScore();
  const scoreBadge = getScoreBadge(performanceScore);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Dashboard de Rendimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={isMonitoring ? handleStopAnalysis : handleStartAnalysis}
              disabled={isAnalyzing}
              variant={isMonitoring ? "destructive" : "default"}
              className="flex items-center space-x-2"
            >
              {isMonitoring ? (
                <>
                  <Activity className="h-4 w-4" />
                  <span>Detener Monitoreo</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Iniciar Análisis</span>
                </>
              )}
            </Button>
            
            {isAnalyzing && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Analizando rendimiento...</span>
              </div>
            )}
          </div>

          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                  {performanceScore}
                </div>
                <div className="text-sm text-muted-foreground">Puntuación</div>
                <Badge variant={scoreBadge.variant} className="mt-1">
                  {scoreBadge.label}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.fps}</div>
                <div className="text-sm text-muted-foreground">FPS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.memory.percentage}%</div>
                <div className="text-sm text-muted-foreground">Memoria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.timing.firstContentfulPaint}ms</div>
                <div className="text-sm text-muted-foreground">FCP</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gauge className="h-5 w-5" />
              <span>Métricas en Tiempo Real</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {metrics ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">FPS</span>
                    <span className="text-sm">{metrics.fps}</span>
                  </div>
                  <Progress 
                    value={(metrics.fps / 60) * 100} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Memoria</span>
                    <span className="text-sm">
                      {metrics.memory.used}MB / {metrics.memory.total}MB
                    </span>
                  </div>
                  <Progress 
                    value={metrics.memory.percentage} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
                  <div>
                    <div className="font-medium">DOM Content Loaded</div>
                    <div className="text-muted-foreground">{metrics.timing.domContentLoaded}ms</div>
                  </div>
                  <div>
                    <div className="font-medium">Load Complete</div>
                    <div className="text-muted-foreground">{metrics.timing.loadComplete}ms</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Inicia el monitoreo para ver métricas en tiempo real</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Core Web Vitals</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitals ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">
                      {vitals.LCP ? Math.round(vitals.LCP) : '-'}ms
                    </div>
                    <div className="text-sm text-muted-foreground">LCP</div>
                    <div className="text-xs text-muted-foreground">Largest Contentful Paint</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">
                      {vitals.FID ? Math.round(vitals.FID) : '-'}ms
                    </div>
                    <div className="text-sm text-muted-foreground">FID</div>
                    <div className="text-xs text-muted-foreground">First Input Delay</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">
                      {vitals.CLS ? vitals.CLS.toFixed(3) : '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">CLS</div>
                    <div className="text-xs text-muted-foreground">Cumulative Layout Shift</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-bold">
                      {vitals.TTFB ? Math.round(vitals.TTFB) : '-'}ms
                    </div>
                    <div className="text-sm text-muted-foreground">TTFB</div>
                    <div className="text-xs text-muted-foreground">Time to First Byte</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Cargando Core Web Vitals...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Memory Leak Detection */}
      {memoryTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5" />
              <span>Detección de Memory Leaks</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-32 border rounded-lg p-4 bg-muted/20">
                <div className="text-sm text-muted-foreground mb-2">
                  Tendencia de uso de memoria (últimas 20 mediciones)
                </div>
                <div className="flex items-end h-20 space-x-1">
                  {memoryTrend.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${(value / Math.max(...memoryTrend)) * 100}%` }}
                      className="flex-1 bg-blue-500 rounded-sm min-h-[2px]"
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Actual: {memoryTrend[memoryTrend.length - 1]?.toFixed(1)}MB
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Sugerencias de Optimización</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <p className="text-sm">{suggestion}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bundle Analysis */}
      {bundleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="h-5 w-5" />
              <span>Análisis de Bundle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold">{formatBytes(bundleInfo.totalSize)}</div>
                <div className="text-sm text-muted-foreground">Tamaño Total</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold">{formatBytes(bundleInfo.gzippedSize)}</div>
                <div className="text-sm text-muted-foreground">Comprimido (Gzip)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
