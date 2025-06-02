#!/bin/bash
echo "🔄 Reiniciando servidor de desarrollo..."
echo "🔍 Buscando procesos de Next.js..."

# Buscar y matar procesos de Next.js
pkill -f "next dev" || echo "No se encontraron procesos de Next.js"

echo "🧹 Limpiando caché..."
rm -rf /workspaces/studio/.next/cache || echo "No se pudo limpiar la caché"

echo "🚀 Iniciando servidor..."
cd /workspaces/studio
npm run dev
