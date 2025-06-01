'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, FileText, LogIn, Zap } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Si ya está autenticado, redirigir al dashboard
    if (status === 'authenticated' && !redirecting) {
      setRedirecting(true);
      // Usar un timeout pequeño para evitar conflictos de hidratación
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    }
  }, [status, router, redirecting]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'authenticated' || redirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }


  // Landing page para usuarios no autenticados
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-headline font-bold mb-6">
            Synergy Suite
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plataforma integral para colaboración, organización y productividad. 
            Gestiona tareas, eventos y documentos en un solo lugar.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/signin">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar Sesión
            </Link>
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Visualiza métricas y estadísticas de tu productividad en tiempo real.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Calendario</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestiona eventos y citas con un calendario interactivo y colaborativo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Colabora en documentos en tiempo real con tu equipo.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Smart-Assist</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                IA integrada para optimizar tareas y generar insights inteligentes.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-headline font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Accede con las credenciales demo para explorar todas las funcionalidades.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Usuario:</strong> demo@example.com</p>
            <p><strong>Contraseña:</strong> demo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
