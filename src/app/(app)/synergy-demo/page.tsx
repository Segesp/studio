'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Eye, 
  TestTube, 
  Monitor, 
  Sparkles,
  CheckCircle,
  Clock,
  Gauge
} from 'lucide-react';

// Import our new components
import { AnimationTestSuite } from '@/components/testing/animation-test-suite';
import { PerformanceDashboard } from '@/components/dashboard/performance-dashboard';
import { AccessibilityAudit } from '@/components/accessibility/accessibility-audit';

// Import animation components for demonstration
import { EnhancedLoader } from '@/components/ui/enhanced-loader';
import { MicroInteraction } from '@/components/ui/micro-interactions';
import { AnimatedChart, AnimatedCounter, AnimatedProgressRing } from '@/components/ui/chart-animations';
import { AdvancedLoadingState } from '@/components/ui/advanced-loading-state';
import { AccessibleButton, AccessibleProgress, SkipToContent } from '@/components/ui/accessibility';

// Demo data for charts
const demoData = [
  { name: 'Ene', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Abr', value: 800 },
  { name: 'May', value: 600 },
  { name: 'Jun', value: 700 },
];

export default function SynergySuiteDemo() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState({
    step1: false,
    step2: false,
    step3: false,
  });

  const startDemo = (demoType: string) => {
    setActiveDemo(demoType);
    
    if (demoType === 'loading') {
      // Simulate multi-step loading process
      setLoadingStates({ step1: true, step2: false, step3: false });
      
      setTimeout(() => {
        setLoadingStates({ step1: true, step2: true, step3: false });
      }, 1500);
      
      setTimeout(() => {
        setLoadingStates({ step1: true, step2: true, step3: true });
      }, 3000);
      
      setTimeout(() => {
        setActiveDemo(null);
        setLoadingStates({ step1: false, step2: false, step3: false });
      }, 4500);
    } else {
      setTimeout(() => setActiveDemo(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SkipToContent />
      
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Synergy Suite - Fases 8 y 9 Completadas
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Demostración completa de optimizaciones de rendimiento, animaciones avanzadas, 
            y mejoras de accesibilidad implementadas en el dashboard.
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="default" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Fase 8: Optimización</span>
            </Badge>
            <Badge variant="default" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>Fase 9: Accesibilidad</span>
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <main id="main-content" tabIndex={-1}>
          <Tabs defaultValue="demos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="demos" className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Demostraciones</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Rendimiento</span>
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Accesibilidad</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center space-x-2">
                <TestTube className="h-4 w-4" />
                <span>Pruebas</span>
              </TabsTrigger>
            </TabsList>

            {/* Demos Tab */}
            <TabsContent value="demos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demostraciones Interactivas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Enhanced Loaders Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Enhanced Loaders</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {(['spin', 'pulse', 'dots', 'progress', 'skeleton'] as const).map(variant => (
                        <div key={variant} className="text-center space-y-2">
                          <div className="h-16 flex items-center justify-center border rounded-lg">
                            <EnhancedLoader variant={variant} size="lg" />
                          </div>
                          <p className="text-sm capitalize">{variant}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Micro Interactions Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Micro Interacciones</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <MicroInteraction type="hover">
                        <div className="p-4 border rounded-lg text-center cursor-pointer">
                          Hover Effect
                        </div>
                      </MicroInteraction>
                      
                      <MicroInteraction type="tap">
                        <Button variant="outline" className="w-full">
                          Tap Animation
                        </Button>
                      </MicroInteraction>
                      
                      <MicroInteraction type="magnetic">
                        <div className="p-4 bg-primary text-primary-foreground rounded-lg text-center cursor-pointer">
                          Magnetic
                        </div>
                      </MicroInteraction>
                      
                      <MicroInteraction type="floating">
                        <div className="p-4 bg-secondary rounded-lg text-center">
                          Floating
                        </div>
                      </MicroInteraction>
                    </div>
                  </div>

                  {/* Chart Animations Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Animaciones de Gráficos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Contador Animado</p>
                        <div className="p-4 border rounded-lg text-center">
                          <AnimatedCounter
                            value={1234}
                            duration={2}
                            className="text-2xl font-bold"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Anillo de Progreso</p>
                        <div className="p-4 border rounded-lg flex justify-center">
                          <AnimatedProgressRing
                            progress={75}
                            size={80}
                            strokeWidth={8}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Gráfico Animado</p>
                        <div className="p-4 border rounded-lg">
                          <AnimatedChart>
                            <div className="flex items-end space-x-1 h-16">
                              {[40, 70, 50, 90, 60].map((height, i) => (
                                <motion.div
                                  key={i}
                                  className="bg-primary flex-1 rounded-t"
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: i * 0.1, duration: 0.6 }}
                                />
                              ))}
                            </div>
                          </AnimatedChart>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Loading States Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Estados de Carga Avanzados</h3>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => startDemo('loading')}
                        disabled={activeDemo === 'loading'}
                        className="w-full"
                      >
                        Demostrar Carga Multi-Paso
                      </Button>
                      
                      {activeDemo === 'loading' && (
                        <Card className="p-6">
                          <AdvancedLoadingState
                            states={[
                              { 
                                status: loadingStates.step1 ? 'success' : 'loading',
                                message: 'Cargando datos',
                                progress: loadingStates.step1 ? 100 : 50
                              },
                              { 
                                status: loadingStates.step2 ? 'success' : 'loading',
                                message: 'Procesando información',
                                progress: loadingStates.step2 ? 100 : 30
                              },
                              { 
                                status: loadingStates.step3 ? 'success' : 'loading',
                                message: 'Finalizando',
                                progress: loadingStates.step3 ? 100 : 10
                              },
                            ]}
                          />
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Accessibility Components Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Componentes Accesibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <AccessibleButton
                          ariaLabel="Botón de ejemplo accesible"
                          onClick={() => startDemo('accessible-button')}
                        >
                          Botón Accesible
                        </AccessibleButton>
                        
                        <AccessibleProgress
                          value={65}
                          label="Progreso del proyecto"
                          showValue
                        />
                      </div>
                      
                      <div className="p-4 border rounded-lg space-y-2">
                        <p className="text-sm font-medium">Características de Accesibilidad:</p>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Navegación por teclado completa</li>
                          <li>• Soporte para lectores de pantalla</li>
                          <li>• Indicadores de foco visibles</li>
                          <li>• Respeto por prefers-reduced-motion</li>
                          <li>• Etiquetas ARIA apropiadas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <PerformanceDashboard />
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility">
              <AccessibilityAudit />
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing">
              <AnimationTestSuite />
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-8 border-t"
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Synergy Suite - Fases 8 y 9 implementadas con éxito
            </p>
            <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <Gauge className="h-3 w-3" />
                <span>Optimizado para rendimiento</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>Completamente accesible</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Animaciones fluidas</span>
              </span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
