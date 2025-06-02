#!/bin/bash

echo "🔧 DIAGNÓSTICO DE ERROR SIGNIN"
echo "=============================="
echo ""

# Verificar archivos en directorio signin
echo "📁 Archivos en /auth/signin/:"
ls -la /workspaces/studio/src/app/auth/signin/

echo ""
echo "📄 Contenido de page.tsx:"
echo "========================="
cat /workspaces/studio/src/app/auth/signin/page.tsx

echo ""
echo "🔍 Verificando componente SignInForm:"
echo "===================================="
grep -n "export function SignInForm" /workspaces/studio/src/components/auth/signin-form.tsx

echo ""
echo "🌐 Probando endpoint de signin:"
echo "================================"
sleep 3  # Esperar que el servidor inicie
curl -I http://localhost:9002/auth/signin 2>/dev/null || echo "❌ Servidor no responde"

echo ""
echo "✅ Diagnóstico completado"
