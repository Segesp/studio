#!/bin/bash

echo "🔧 Verificando configuración de autenticación..."
echo ""

# Verificar variables de entorno
echo "📋 Variables de entorno:"
echo "DATABASE_URL: $(if [ -n "$DATABASE_URL" ]; then echo "✅ Configurada"; else echo "❌ No configurada"; fi)"
echo "NEXTAUTH_SECRET: $(if [ -n "$NEXTAUTH_SECRET" ]; then echo "✅ Configurada"; else echo "❌ No configurada"; fi)"
echo "NEXTAUTH_URL: $(if [ -n "$NEXTAUTH_URL" ]; then echo "✅ Configurada ($NEXTAUTH_URL)"; else echo "❌ No configurada"; fi)"
echo ""

# Verificar base de datos
echo "🗄️  Verificando base de datos..."
if [ -f "prisma/dev.db" ]; then
    echo "✅ Base de datos existe: prisma/dev.db"
else
    echo "❌ Base de datos no encontrada"
fi
echo ""

# Verificar archivos clave
echo "📁 Verificando archivos clave:"
files=(
    "src/pages/api/auth/[...nextauth].ts"
    "src/middleware.ts"
    "src/app/auth/signin/page.tsx"
    "src/app/(app)/layout.tsx"
    ".env.local"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
    fi
done

echo ""
echo "🚀 Para iniciar el servidor:"
echo "   npm run dev"
echo ""
echo "🌐 Una vez iniciado, visitar:"
echo "   http://localhost:9002"
echo ""
echo "🔑 Credenciales demo:"
echo "   Email: demo@example.com"
echo "   Password: demo"
