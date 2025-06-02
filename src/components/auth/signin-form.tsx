'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export function SignInForm() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Intenta con demo@example.com / demo');
      } else if (result?.ok) {
        // Login exitoso - redirigir al dashboard
        console.log('Login exitoso, redirigiendo...');
        window.location.href = '/dashboard';
      } else {
        setError('Error inesperado durante el login');
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Synergy Suite</CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={async () => {
              setIsLoading(true);
              setError('');
              
              try {
                const result = await signIn('credentials', {
                  email: 'demo@example.com',
                  password: 'demo',
                  redirect: false,
                });

                if (result?.error) {
                  setError('Error con credenciales demo');
                } else if (result?.ok) {
                  console.log('Demo login exitoso, redirigiendo...');
                  window.location.href = '/dashboard';
                } else {
                  setError('Error inesperado con demo');
                }
              } catch (error) {
                console.error('Error en demo login:', error);
                setError('Error de conexión');
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            Acceso Demo Rápido
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p><strong>Demo:</strong> demo@example.com / demo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
