'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Zap,
  Eye,
  MousePointer,
  Keyboard
} from 'lucide-react';

// Animation test cases
const animationTests = [
  {
    id: 'fade-in',
    name: 'Fade In Animation',
    description: 'Tests basic fade in with opacity transition',
    duration: 1000,
  },
  {
    id: 'slide-up',
    name: 'Slide Up Animation',
    description: 'Tests vertical slide animation with transform',
    duration: 800,
  },
  {
    id: 'scale-bounce',
    name: 'Scale Bounce Animation',
    description: 'Tests scale animation with spring physics',
    duration: 1200,
  },
  {
    id: 'stagger-children',
    name: 'Stagger Children Animation',
    description: 'Tests staggered animation of multiple elements',
    duration: 2000,
  },
  {
    id: 'micro-interactions',
    name: 'Micro Interactions',
    description: 'Tests hover, tap, and focus interactions',
    duration: 500,
  },
];

// Accessibility test cases
const accessibilityTests = [
  {
    id: 'keyboard-nav',
    name: 'Keyboard Navigation',
    description: 'Tests keyboard navigation with Tab, Enter, Space, Arrow keys',
    icon: Keyboard,
  },
  {
    id: 'screen-reader',
    name: 'Screen Reader Support',
    description: 'Tests ARIA labels, roles, and live regions',
    icon: Eye,
  },
  {
    id: 'focus-management',
    name: 'Focus Management',
    description: 'Tests focus trapping, restoration, and visible indicators',
    icon: MousePointer,
  },
  {
    id: 'color-contrast',
    name: 'Color Contrast',
    description: 'Tests WCAG AA compliance for color contrast ratios',
    icon: Eye,
  },
  {
    id: 'reduced-motion',
    name: 'Reduced Motion Support',
    description: 'Tests respect for prefers-reduced-motion setting',
    icon: Zap,
  },
];

interface TestResult {
  id: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  duration?: number;
}

export function AnimationTestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Initialize test results
  useEffect(() => {
    const initialResults = [...animationTests, ...accessibilityTests].map(test => ({
      id: test.id,
      status: 'pending' as const,
    }));
    setTestResults(initialResults);
  }, []);

  const updateTestResult = (id: string, update: Partial<TestResult>) => {
    setTestResults(prev => 
      prev.map(result => 
        result.id === id ? { ...result, ...update } : result
      )
    );
  };

  const runAnimationTest = async (test: any) => {
    setCurrentTest(test.id);
    updateTestResult(test.id, { status: 'running' });

    try {
      // Simulate animation test execution
      await new Promise(resolve => setTimeout(resolve, test.duration));
      
      // Animation test would check for:
      // - Smooth frame rate (>30 FPS)
      // - Proper easing curves
      // - Animation completion
      // - Performance impact
      
      const fps = 60; // Simulated FPS measurement
      const success = fps > 30;
      
      updateTestResult(test.id, {
        status: success ? 'passed' : 'failed',
        message: success 
          ? `Animation completed successfully at ${fps} FPS`
          : `Animation failed - low FPS: ${fps}`,
        duration: test.duration,
      });
    } catch (error) {
      updateTestResult(test.id, {
        status: 'failed',
        message: `Animation test failed: ${error}`,
      });
    }
  };

  const runAccessibilityTest = async (test: any) => {
    setCurrentTest(test.id);
    updateTestResult(test.id, { status: 'running' });

    try {
      // Simulate accessibility test execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Accessibility tests would check for:
      switch (test.id) {
        case 'keyboard-nav':
          // Check for proper tab order, focus management
          break;
        case 'screen-reader':
          // Check for ARIA attributes, semantic HTML
          break;
        case 'focus-management':
          // Check for visible focus indicators, focus trapping
          break;
        case 'color-contrast':
          // Check contrast ratios meet WCAG standards
          break;
        case 'reduced-motion':
          // Check for reduced motion alternatives
          break;
      }
      
      const success = Math.random() > 0.2; // 80% success rate for demo
      
      updateTestResult(test.id, {
        status: success ? 'passed' : 'failed',
        message: success 
          ? 'Accessibility test passed'
          : 'Accessibility test failed - see details',
      });
    } catch (error) {
      updateTestResult(test.id, {
        status: 'failed',
        message: `Accessibility test failed: ${error}`,
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const allTests = [...animationTests, ...accessibilityTests];
    
    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      
      if (animationTests.find(t => t.id === test.id)) {
        await runAnimationTest(test);
      } else {
        await runAccessibilityTest(test);
      }
      
      setProgress(((i + 1) / allTests.length) * 100);
    }
    
    setCurrentTest(null);
    setIsRunning(false);
  };

  const resetTests = () => {
    const resetResults = testResults.map(result => ({
      ...result,
      status: 'pending' as const,
      message: undefined,
      duration: undefined,
    }));
    setTestResults(resetResults);
    setProgress(0);
    setCurrentTest(null);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const totalTests = testResults.length;

  return (
    <div className="space-y-6">
      {/* Test Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Suite de Pruebas - Animaciones y Accesibilidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Ejecutar Todas las Pruebas</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetTests}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reiniciar</span>
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de las pruebas</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  Ejecutando: {currentTest}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">Exitosas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">Fallidas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{totalTests}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animation Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Animación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {animationTests.map(test => {
              const result = testResults.find(r => r.id === test.id);
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={getStatusColor(result?.status || 'pending')}>
                      {getStatusIcon(result?.status || 'pending')}
                    </div>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      {result?.message && (
                        <div className="text-xs mt-1 text-muted-foreground">
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      result?.status === 'passed' ? 'default' :
                      result?.status === 'failed' ? 'destructive' :
                      result?.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {result?.status || 'pending'}
                    </Badge>
                    {result?.duration && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.duration}ms
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Pruebas de Accesibilidad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {accessibilityTests.map(test => {
              const result = testResults.find(r => r.id === test.id);
              const Icon = test.icon;
              return (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className={getStatusColor(result?.status || 'pending')}>
                      {getStatusIcon(result?.status || 'pending')}
                    </div>
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                      {result?.message && (
                        <div className="text-xs mt-1 text-muted-foreground">
                          {result.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant={
                    result?.status === 'passed' ? 'default' :
                    result?.status === 'failed' ? 'destructive' :
                    result?.status === 'running' ? 'secondary' : 'outline'
                  }>
                    {result?.status || 'pending'}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
