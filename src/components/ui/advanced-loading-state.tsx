'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { EnhancedLoader } from '@/components/ui/enhanced-loader';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingState {
  status: 'loading' | 'success' | 'error';
  message?: string;
  progress?: number;
  steps?: string[];
  currentStep?: number;
}

interface AdvancedLoadingStateProps {
  states: LoadingState[];
  className?: string;
  onComplete?: () => void;
  showSteps?: boolean;
}

export function AdvancedLoadingState({ 
  states, 
  className,
  onComplete,
  showSteps = false 
}: AdvancedLoadingStateProps) {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const currentState = states[currentStateIndex];

  useEffect(() => {
    if (currentState.status === 'success' && currentStateIndex < states.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStateIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (currentState.status === 'success' && currentStateIndex === states.length - 1) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentState.status, currentStateIndex, states.length, onComplete]);

  const containerVariants = {
    initial: { opacity: 0, scale: 0.95 },
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
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  const progressVariants = {
    initial: { width: '0%' },
    animate: { 
      width: `${((currentStateIndex + 1) / states.length) * 100}%`,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const stepVariants = {
    pending: { 
      scale: 1, 
      backgroundColor: 'hsl(var(--muted))',
      transition: { duration: 0.2 }
    },
    active: { 
      scale: 1.1, 
      backgroundColor: 'hsl(var(--primary))',
      transition: { duration: 0.3 }
    },
    completed: { 
      scale: 1, 
      backgroundColor: 'hsl(var(--primary))',
      transition: { duration: 0.2 }
    },
    error: { 
      scale: 1, 
      backgroundColor: 'hsl(var(--destructive))',
      transition: { duration: 0.2 }
    }
  };

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStateIndex) return 'completed';
    if (stepIndex === currentStateIndex) {
      if (currentState.status === 'error') return 'error';
      return 'active';
    }
    return 'pending';
  };

  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center p-8 space-y-6',
        className
      )}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Main loading indicator */}
      <div className="text-center space-y-4">
        <AnimatePresence mode="wait">
          {currentState.status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center space-y-4"
            >
              <EnhancedLoader 
                variant="dots" 
                size="lg" 
                text={currentState.message}
              />
            </motion.div>
          )}
          
          {currentState.status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              <p className="text-lg font-medium text-green-700">
                {currentState.message || 'Completado'}
              </p>
            </motion.div>
          )}
          
          {currentState.status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center space-y-4"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <AlertCircle className="h-16 w-16 text-red-500" />
              </motion.div>
              <p className="text-lg font-medium text-red-700">
                {currentState.message || 'Error'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            variants={progressVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Paso {currentStateIndex + 1}</span>
          <span>{states.length} pasos</span>
        </div>
      </div>

      {/* Steps indicator */}
      {showSteps && (
        <div className="flex space-x-4">
          {states.map((_, index) => (
            <motion.div
              key={index}
              className="w-4 h-4 rounded-full"
              variants={stepVariants}
              animate={getStepStatus(index)}
            />
          ))}
        </div>
      )}

      {/* Current progress percentage */}
      {currentState.progress !== undefined && (
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold text-primary"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            {Math.round(currentState.progress)}%
          </motion.div>
          <p className="text-sm text-muted-foreground">Progreso</p>
        </div>
      )}
    </motion.div>
  );
}

// Preset loading states for common scenarios
export const loadingPresets = {
  dashboard: [
    { 
      status: 'loading' as const, 
      message: 'Cargando estadísticas...', 
      progress: 25 
    },
    { 
      status: 'loading' as const, 
      message: 'Obteniendo métricas de productividad...', 
      progress: 50 
    },
    { 
      status: 'loading' as const, 
      message: 'Procesando datos de actividad...', 
      progress: 75 
    },
    { 
      status: 'success' as const, 
      message: 'Dashboard cargado exitosamente', 
      progress: 100 
    },
  ],
  
  charts: [
    { 
      status: 'loading' as const, 
      message: 'Preparando gráficos...', 
      progress: 33 
    },
    { 
      status: 'loading' as const, 
      message: 'Renderizando visualizaciones...', 
      progress: 66 
    },
    { 
      status: 'success' as const, 
      message: 'Gráficos listos', 
      progress: 100 
    },
  ],
  
  dataSync: [
    { 
      status: 'loading' as const, 
      message: 'Sincronizando con el servidor...', 
      progress: 20 
    },
    { 
      status: 'loading' as const, 
      message: 'Validando datos...', 
      progress: 40 
    },
    { 
      status: 'loading' as const, 
      message: 'Actualizando cache...', 
      progress: 60 
    },
    { 
      status: 'loading' as const, 
      message: 'Finalizando sincronización...', 
      progress: 80 
    },
    { 
      status: 'success' as const, 
      message: 'Datos sincronizados', 
      progress: 100 
    },
  ],
};
