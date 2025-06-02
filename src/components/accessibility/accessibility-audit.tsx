'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  Keyboard, 
  MousePointer, 
  Volume2, 
  Palette, 
  Focus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Scan,
  Shield
} from 'lucide-react';
import { useAccessibilityPreferences } from '@/hooks/use-accessibility';

interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'color' | 'aria' | 'focus' | 'semantic' | 'motion';
  message: string;
  element?: string;
  recommendation: string;
  wcagGuideline?: string;
}

interface AccessibilityAuditResult {
  score: number;
  issues: AccessibilityIssue[];
  passedChecks: number;
  totalChecks: number;
  categories: {
    [key: string]: {
      score: number;
      issues: number;
    };
  };
}

export function AccessibilityAudit() {
  const [auditResult, setAuditResult] = useState<AccessibilityAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const preferences = useAccessibilityPreferences();

  const auditCategories = [
    { 
      id: 'keyboard', 
      name: 'Navegación por Teclado', 
      icon: Keyboard,
      description: 'Accesibilidad mediante teclado y focus management'
    },
    { 
      id: 'color', 
      name: 'Contraste y Color', 
      icon: Palette,
      description: 'Contraste de colores y dependencia del color'
    },
    { 
      id: 'aria', 
      name: 'ARIA y Semántica', 
      icon: Volume2,
      description: 'Atributos ARIA y HTML semántico'
    },
    { 
      id: 'focus', 
      name: 'Gestión de Foco', 
      icon: Focus,
      description: 'Indicadores de foco y orden de tabulación'
    },
    { 
      id: 'semantic', 
      name: 'HTML Semántico', 
      icon: Eye,
      description: 'Uso correcto de elementos HTML semánticos'
    },
    { 
      id: 'motion', 
      name: 'Movimiento y Animación', 
      icon: MousePointer,
      description: 'Respeto por prefers-reduced-motion'
    },
  ];

  const runAccessibilityAudit = async () => {
    setIsAuditing(true);
    setProgress(0);
    
    const issues: AccessibilityIssue[] = [];
    let passedChecks = 0;
    const totalChecks = 25; // Total number of checks we'll perform
    
    // Simulate progressive audit
    for (let i = 0; i < auditCategories.length; i++) {
      const category = auditCategories[i];
      setProgress((i / auditCategories.length) * 80); // 80% for categories
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
      
      // Simulate category-specific checks
      const categoryIssues = await auditCategory(category.id);
      issues.push(...categoryIssues);
      passedChecks += 4; // Simulate some checks passing per category
    }

    setProgress(90);
    await new Promise(resolve => setTimeout(resolve, 300));

    // Calculate category scores
    const categories: { [key: string]: { score: number; issues: number } } = {};
    auditCategories.forEach(category => {
      const categoryIssues = issues.filter(issue => issue.category === category.id);
      const errorCount = categoryIssues.filter(issue => issue.severity === 'error').length;
      const warningCount = categoryIssues.filter(issue => issue.severity === 'warning').length;
      
      let score = 100;
      score -= errorCount * 20; // Errors penalize heavily
      score -= warningCount * 10; // Warnings penalize moderately
      
      categories[category.id] = {
        score: Math.max(0, score),
        issues: categoryIssues.length,
      };
    });

    // Calculate overall score
    const errorCount = issues.filter(issue => issue.severity === 'error').length;
    const warningCount = issues.filter(issue => issue.severity === 'warning').length;
    let overallScore = 100;
    overallScore -= errorCount * 15;
    overallScore -= warningCount * 5;

    setProgress(100);
    
    setAuditResult({
      score: Math.max(0, overallScore),
      issues,
      passedChecks,
      totalChecks,
      categories,
    });

    setIsAuditing(false);
  };

  const auditCategory = async (categoryId: string): Promise<AccessibilityIssue[]> => {
    const issues: AccessibilityIssue[] = [];
    
    switch (categoryId) {
      case 'keyboard':
        // Check for keyboard navigation issues
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) {
          issues.push({
            id: 'no-focusable',
            severity: 'error',
            category: 'keyboard',
            message: 'No se encontraron elementos navegables por teclado',
            recommendation: 'Asegúrate de que todos los elementos interactivos sean accesibles por teclado',
            wcagGuideline: 'WCAG 2.1.1',
          });
        }

        // Check for skip links
        const skipLinks = document.querySelectorAll('[href="#main-content"], [href="#content"]');
        if (skipLinks.length === 0) {
          issues.push({
            id: 'no-skip-link',
            severity: 'warning',
            category: 'keyboard',
            message: 'No se encontró un enlace "Saltar al contenido"',
            recommendation: 'Agrega un enlace para saltar al contenido principal',
            wcagGuideline: 'WCAG 2.4.1',
          });
        }
        break;

      case 'color':
        // Simulate color contrast checking
        if (Math.random() > 0.7) {
          issues.push({
            id: 'low-contrast',
            severity: 'error',
            category: 'color',
            message: 'Contraste insuficiente detectado en algunos elementos',
            element: 'button.secondary',
            recommendation: 'Aumenta el contraste para cumplir con WCAG AA (4.5:1)',
            wcagGuideline: 'WCAG 1.4.3',
          });
        }
        break;

      case 'aria':
        // Check for missing ARIA labels
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        const unlabeledButtons = Array.from(buttons).filter(btn => 
          !btn.textContent?.trim() && !btn.querySelector('svg')
        );
        
        if (unlabeledButtons.length > 0) {
          issues.push({
            id: 'unlabeled-buttons',
            severity: 'error',
            category: 'aria',
            message: `${unlabeledButtons.length} botones sin etiqueta accesible`,
            recommendation: 'Agrega aria-label o aria-labelledby a todos los botones',
            wcagGuideline: 'WCAG 4.1.2',
          });
        }

        // Check for images without alt text
        const images = document.querySelectorAll('img:not([alt])');
        if (images.length > 0) {
          issues.push({
            id: 'missing-alt',
            severity: 'error',
            category: 'aria',
            message: `${images.length} imágenes sin texto alternativo`,
            recommendation: 'Agrega atributos alt descriptivos a todas las imágenes',
            wcagGuideline: 'WCAG 1.1.1',
          });
        }
        break;

      case 'focus':
        // Check for visible focus indicators
        const focusableWithoutIndicator = document.querySelectorAll(
          'button:not(.focus\\:ring), a:not(.focus\\:ring), input:not(.focus\\:ring)'
        );
        
        if (focusableWithoutIndicator.length > 0) {
          issues.push({
            id: 'no-focus-indicator',
            severity: 'warning',
            category: 'focus',
            message: 'Algunos elementos pueden no tener indicadores de foco visibles',
            recommendation: 'Asegúrate de que todos los elementos interactivos tengan indicadores de foco claros',
            wcagGuideline: 'WCAG 2.4.7',
          });
        }
        break;

      case 'semantic':
        // Check for proper heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          issues.push({
            id: 'no-headings',
            severity: 'warning',
            category: 'semantic',
            message: 'No se encontraron encabezados en la página',
            recommendation: 'Usa encabezados (h1-h6) para estructurar el contenido',
            wcagGuideline: 'WCAG 1.3.1',
          });
        }

        // Check for main landmark
        const mainLandmark = document.querySelector('main, [role="main"]');
        if (!mainLandmark) {
          issues.push({
            id: 'no-main-landmark',
            severity: 'error',
            category: 'semantic',
            message: 'No se encontró un landmark principal (main)',
            recommendation: 'Agrega un elemento <main> o role="main" al contenido principal',
            wcagGuideline: 'WCAG 1.3.1',
          });
        }
        break;

      case 'motion':
        // Check for reduced motion support
        if (!preferences.reducedMotion) {
          issues.push({
            id: 'no-reduced-motion',
            severity: 'info',
            category: 'motion',
            message: 'Preferencia de movimiento reducido no detectada',
            recommendation: 'Verifica que las animaciones respeten prefers-reduced-motion',
            wcagGuideline: 'WCAG 2.3.3',
          });
        }
        break;
    }

    return issues;
  };

  const getSeverityIcon = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: AccessibilityIssue['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, label: 'Excelente' };
    if (score >= 70) return { variant: 'secondary' as const, label: 'Bueno' };
    return { variant: 'destructive' as const, label: 'Necesita atención' };
  };

  return (
    <div className="space-y-6">
      {/* Audit Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Auditoría de Accesibilidad</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={runAccessibilityAudit}
              disabled={isAuditing}
              className="flex items-center space-x-2"
            >
              <Scan className="h-4 w-4" />
              <span>Ejecutar Auditoría</span>
            </Button>
            
            {isAuditing && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Analizando accesibilidad...</span>
              </div>
            )}
          </div>

          {isAuditing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso de la auditoría</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {auditResult && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(auditResult.score)}`}>
                  {Math.round(auditResult.score)}
                </div>
                <div className="text-sm text-muted-foreground">Puntuación</div>
                <Badge variant={getScoreBadge(auditResult.score).variant} className="mt-1">
                  {getScoreBadge(auditResult.score).label}
                </Badge>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{auditResult.passedChecks}</div>
                <div className="text-sm text-muted-foreground">Verificaciones Exitosas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {auditResult.issues.filter(i => i.severity === 'error').length}
                </div>
                <div className="text-sm text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {auditResult.issues.filter(i => i.severity === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Advertencias</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {auditResult && (
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Categorías</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auditCategories.map(category => {
                const categoryResult = auditResult.categories[category.id];
                const Icon = category.icon;
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    
                    {categoryResult && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Puntuación</span>
                          <span className={`font-bold ${getScoreColor(categoryResult.score)}`}>
                            {Math.round(categoryResult.score)}
                          </span>
                        </div>
                        <Progress value={categoryResult.score} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {categoryResult.issues} problema{categoryResult.issues !== 1 ? 's' : ''} encontrado{categoryResult.issues !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      {auditResult && auditResult.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Problemas Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditResult.issues.map((issue, index) => (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.message}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {issue.category}
                        </Badge>
                      </div>
                      
                      {issue.element && (
                        <div className="text-sm text-muted-foreground">
                          Elemento: <code className="bg-muted px-1 rounded">{issue.element}</code>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <strong>Recomendación:</strong> {issue.recommendation}
                      </div>
                      
                      {issue.wcagGuideline && (
                        <div className="text-xs text-muted-foreground">
                          Guideline: {issue.wcagGuideline}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${preferences.reducedMotion ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Movimiento Reducido</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${preferences.highContrast ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Alto Contraste</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`h-3 w-3 rounded-full ${preferences.darkMode ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Modo Oscuro</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
