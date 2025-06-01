'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, LogIn } from 'lucide-react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || null;

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Error de configuración del servidor. Contacta al administrador.';
      case 'AccessDenied':
        return 'Acceso denegado. No tienes permisos para acceder.';
      case 'Verification':
        return 'Error de verificación. El token puede haber expirado.';
      case 'Default':
        return 'Ha ocurrido un error durante la autenticación.';
      case 'Signin':
        return 'Error al iniciar sesión. Intenta nuevamente.';
      case 'OAuthSignin':
        return 'Error al conectar con el proveedor OAuth.';
      case 'OAuthCallback':
        return 'Error en el callback de OAuth.';
      case 'OAuthCreateAccount':
        return 'Error al crear cuenta con OAuth.';
      case 'EmailCreateAccount':
        return 'Error al crear cuenta con email.';
      case 'Callback':
        return 'Error en el callback de autenticación.';
      case 'OAuthAccountNotLinked':
        return 'Email ya registrado con otro proveedor.';
      case 'EmailSignin':
        return 'Error al enviar email de verificación.';
      case 'CredentialsSignin':
        return 'Credenciales inválidas. Verifica tu email y contraseña.';
      case 'SessionRequired':
        return 'Sesión requerida. Inicia sesión para continuar.';
      default:
        return 'Ha ocurrido un error inesperado durante la autenticación.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Error de Autenticación
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <p><strong>Código de error:</strong> {error || 'Desconocido'}</p>
          </div>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Intentar Nuevamente
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p>Si el problema persiste, contacta al soporte técnico.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div>Cargando...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
