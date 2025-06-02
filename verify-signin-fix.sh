#!/bin/bash

echo "🔍 VERIFICACIÓN DEL PROBLEMA DE SIGNIN RESUELTO"
echo "=============================================="
echo ""

# Verificar estructura de archivos
echo "📁 Verificando estructura de archivos..."
SIGNIN_DIR="/workspaces/studio/src/app/auth/signin"

if [ -d "$SIGNIN_DIR" ]; then
    echo "✅ Directorio signin existe"
    
    # Contar archivos en el directorio
    FILE_COUNT=$(ls -1 "$SIGNIN_DIR" | wc -l)
    echo "📄 Archivos encontrados: $FILE_COUNT"
    
    # Listar archivos
    echo "📋 Contenido del directorio:"
    ls -la "$SIGNIN_DIR"
    
    # Verificar que solo existe page.tsx
    if [ -f "$SIGNIN_DIR/page.tsx" ] && [ $FILE_COUNT -eq 1 ]; then
        echo "✅ Solo existe page.tsx (correcto)"
    else
        echo "⚠️  Archivos inesperados detectados"
    fi
else
    echo "❌ Directorio signin no existe"
fi

echo ""
echo "🔧 Verificando componentes..."

# Verificar SignInForm
SIGNIN_FORM="/workspaces/studio/src/components/auth/signin-form.tsx"
if [ -f "$SIGNIN_FORM" ]; then
    echo "✅ SignInForm existe"
else
    echo "❌ SignInForm faltante"
fi

echo ""
echo "🌐 Verificando servidor..."

# Verificar que el servidor responda
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 | grep -q "200\|302"; then
    echo "✅ Servidor respondiendo en puerto 9002"
else
    echo "⚠️  Servidor no responde (puede estar iniciándose)"
fi

echo ""
echo "🎯 PASOS PARA PROBAR:"
echo "1. Abrir http://localhost:9002"
echo "2. Hacer clic en 'Iniciar Sesión'"
echo "3. Usar credenciales: demo@example.com / demo"
echo "4. Verificar redirección al dashboard"
echo ""
echo "🔍 Si hay problemas, revisar:"
echo "   - Consola del navegador (F12)"
echo "   - Logs del terminal donde corre npm run dev"
echo ""
echo "✅ Verificación completada!"
