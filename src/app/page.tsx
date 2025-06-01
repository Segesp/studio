'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

// Componentes placeholder (asumimos que existen o se crearán)
const PendingTasks = () => <div>Cargando tareas pendientes...</div>;
const UpcomingEvents = () => <div>Cargando próximos eventos...</div>;
const RecentDocuments = () => <div>Cargando documentos recientes...</div>;
const SmartAssistQuickLinks = () => (
  <div>
    <h2>Smart-Assist rápido</h2>
    {/* Aquí irían los enlaces a los formularios de Smart-Assist */}
  </div>
);
const DashboardMetrics = () => <div>Cargando métricas...</div>;

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Opcional: redirigir si no está autenticado (si el dashboard requiere autenticación)
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/login'); // Asume una ruta de login
  //   }
  // }, [status, router]);

  if (status === 'loading') {
    // Puedes mostrar un loader global o un spinner mientras carga la sesión
    return <div>Cargando sesión...</div>;
  } else if (status === 'unauthenticated') {
       // Opcional: Redirigir a la página de login si no hay sesión
       // router.push('/login');
      return <div>Redirigiendo a login...</div>; // O algún mensaje
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tarjetas de métricas */}
        <DashboardMetrics />
        {/* Otros componentes */}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Resumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PendingTasks />
          <UpcomingEvents />
          <RecentDocuments />
        </div>
      </div>

      <div className="mt-8">
        <SmartAssistQuickLinks />
      </div>
    </div>
  );
}
