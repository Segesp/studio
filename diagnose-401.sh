#!/bin/bash

echo "🔍 Diagnóstico del Error 401..."
echo ""

# Verificar si el servidor está corriendo
echo "1. Verificando si el servidor está activo..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:9002/ || echo "❌ Servidor no responde"

echo ""
echo "2. Verificando endpoints de NextAuth..."
curl -s -o /dev/null -w "NextAuth API Status: %{http_code}\n" http://localhost:9002/api/auth/session || echo "❌ API de NextAuth no responde"

echo ""
echo "3. Verificando página de login..."
curl -s -o /dev/null -w "Login Page Status: %{http_code}\n" http://localhost:9002/auth/signin || echo "❌ Página de login no responde"

echo ""
echo "4. Verificando variables de entorno clave..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local existe"
    echo "NEXTAUTH_URL: $(grep NEXTAUTH_URL .env.local | cut -d'=' -f2 | tr -d '"')"
    echo "NEXTAUTH_SECRET: $(if grep -q NEXTAUTH_SECRET .env.local; then echo 'Configurado'; else echo 'No configurado'; fi)"
else
    echo "❌ .env.local no encontrado"
fi

echo ""
echo "5. Verificando base de datos..."
if [ -f "prisma/dev.db" ]; then
    echo "✅ Base de datos existe"
else
    echo "❌ Base de datos no existe"
fi

echo ""
echo "6. Verificando configuración del middleware..."
if grep -q "matcher.*dashboard" src/middleware.ts; then
    echo "✅ Middleware configurado para rutas protegidas"
else
    echo "⚠️  Middleware puede estar afectando rutas no protegidas"
fi

echo ""
echo "🚀 Pasos para resolver el error 401:"
echo "   1. Asegurar que el servidor esté corriendo: npm run dev"
echo "   2. Verificar que todas las rutas de NextAuth funcionen"
echo "   3. Si persiste, revisar logs del servidor para más detalles"
