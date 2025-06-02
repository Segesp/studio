#!/bin/bash
# Script de compilación para producción

set -e

echo "🏗️  COMPILANDO SYNERGY SUITE PARA PRODUCCIÓN"
echo "============================================="

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version)
echo "📋 Versión de Node.js: $NODE_VERSION"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm ci

# Generar cliente Prisma
echo "🗄️  Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones (solo si es necesario)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🔄 Ejecutando migraciones de base de datos..."
    npx prisma migrate deploy
fi

# Compilar aplicación
echo "⚙️  Compilando aplicación..."
npm run build

echo "✅ Compilación completada exitosamente"
echo "🚀 Listo para desplegar con: npm start"
