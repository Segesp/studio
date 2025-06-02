#!/bin/bash

echo "🔍 Verificando el flujo de autenticación de Synergy Suite..."
echo "=================================================="

# Verificar que el servidor esté ejecutándose
echo "📡 Verificando servidor..."
if curl -s http://localhost:9002 > /dev/null; then
    echo "✅ Servidor respondiendo en puerto 9002"
else
    echo "❌ Servidor no responde en puerto 9002"
    exit 1
fi

# Verificar archivos clave
echo ""
echo "📂 Verificando archivos de autenticación..."

# Middleware
if [ -f "/workspaces/studio/src/middleware.ts" ]; then
    echo "✅ Middleware configurado"
else
    echo "❌ Middleware faltante"
fi

# Página de signin
if [ -f "/workspaces/studio/src/app/auth/signin/page.tsx" ]; then
    echo "✅ Página de signin configurada"
else
    echo "❌ Página de signin faltante"
fi

# Componente de signin
if [ -f "/workspaces/studio/src/components/auth/signin-form.tsx" ]; then
    echo "✅ Componente SignInForm configurado"
else
    echo "❌ Componente SignInForm faltante"
fi

# NextAuth API
if [ -f "/workspaces/studio/src/pages/api/auth/[...nextauth].ts" ]; then
    echo "✅ NextAuth API configurada"
else
    echo "❌ NextAuth API faltante"
fi

echo ""
echo "🚀 FLUJO DE PRUEBA:"
echo "1. Abrir http://localhost:9002"
echo "2. Si no está autenticado → debería mostrar página de bienvenida"
echo "3. Hacer clic en 'Iniciar Sesión'"
echo "4. Usar credenciales: demo@example.com / demo"
echo "5. Después del login → redirección automática al dashboard"
echo ""
echo "📋 CREDENCIALES DE PRUEBA:"
echo "   Email: demo@example.com"
echo "   Password: demo"
echo ""
echo "🎯 RUTAS PROTEGIDAS:"
echo "   /dashboard - Panel principal"
echo "   /task-list - Lista de tareas"
echo "   /interactive-calendar - Calendario"
echo "   /collaborative-docs - Documentos"
echo "   /smart-assist - Asistente inteligente"
echo "   /sync - Sincronización"
echo ""
echo "✅ Verificación completada. Servidor listo para pruebas!"
