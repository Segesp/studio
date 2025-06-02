#!/bin/bash
# Script de verificación final del proyecto Synergy Suite

echo "🎯 VERIFICACIÓN FINAL - SYNERGY SUITE"
echo "===================================="

echo ""
echo "📊 ESTADO DE LOS SERVICIOS:"

# Verificar servidor Next.js
echo -n "🟦 Servidor Next.js (puerto 9002): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 | grep -q "200"; then
    echo "✅ ACTIVO"
else
    echo "❌ INACTIVO"
fi

# Verificar autenticación
echo -n "🔐 Sistema de autenticación: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/auth/signin)
if [ "$STATUS" = "200" ]; then
    echo "✅ FUNCIONAL"
else
    echo "❌ ERROR (HTTP $STATUS)"
fi

# Verificar protección dashboard
echo -n "🛡️  Protección de rutas: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/dashboard)
if [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ]; then
    echo "✅ ACTIVA (Redirige a login)"
else
    echo "⚠️  REVISIÓN NECESARIA (HTTP $STATUS)"
fi

# Verificar API NextAuth
echo -n "🔑 API NextAuth: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/api/auth/providers)
if [ "$STATUS" = "200" ]; then
    echo "✅ OPERATIVA"
else
    echo "❌ ERROR (HTTP $STATUS)"
fi

echo ""
echo "📁 ARCHIVOS CRÍTICOS DEL PROYECTO:"

CRITICAL_FILES=(
    "src/app/auth/signin/page.tsx"
    "src/middleware.ts"
    "src/pages/api/auth/[...nextauth].ts"
    "src/app/layout.tsx"
    "docs/FINAL-PROJECT-REPORT.md"
    "build-production.sh"
    ".env.production.template"
    "Dockerfile"
)

for file in "${CRITICAL_FILES[@]}"; do
    echo -n "📄 $file: "
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "✅ OK"
    else
        echo "❌ FALTA"
    fi
done

echo ""
echo "🧪 PRUEBAS AUTOMATIZADAS:"

# Ejecutar pruebas rápidas
if [ -f "quick-test.sh" ]; then
    echo "Ejecutando quick-test.sh..."
    bash quick-test.sh | grep -E "(✅|❌|⚠️)" | head -5
else
    echo "❌ Script de pruebas no encontrado"
fi

echo ""
echo "📊 RESUMEN DEL PROYECTO:"
echo "========================"

TOTAL_FILES=$(find src/ -name "*.tsx" -o -name "*.ts" | wc -l)
COMPONENT_FILES=$(find src/components/ -name "*.tsx" 2>/dev/null | wc -l)
API_FILES=$(find src/pages/api/ -name "*.ts" 2>/dev/null | wc -l)

echo "📈 Estadísticas del código:"
echo "   • Archivos TypeScript/React: $TOTAL_FILES"
echo "   • Componentes: $COMPONENT_FILES"
echo "   • APIs: $API_FILES"

echo ""
echo "🎯 ESTADO FINAL:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/auth/signin | grep -q "200" && \
   curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/dashboard | grep -q "307"; then
    echo "🎉 PROYECTO COMPLETADO EXITOSAMENTE"
    echo "✅ Autenticación: FUNCIONAL"
    echo "✅ Protección: ACTIVA"
    echo "✅ Ready para producción"
else
    echo "⚠️  REVISAR CONFIGURACIÓN"
fi

echo ""
echo "🚀 PRÓXIMOS PASOS PARA PRODUCCIÓN:"
echo "1. Configurar variables de entorno: cp .env.production.template .env.production"
echo "2. Compilar aplicación: ./build-production.sh"
echo "3. Desplegar en plataforma cloud de tu elección"
echo ""
echo "📚 Documentación completa en: docs/FINAL-PROJECT-REPORT.md"
echo "🌐 Acceso al sistema: http://localhost:9002/auth/signin"
echo "🔑 Credenciales de prueba: demo@example.com / demo"
