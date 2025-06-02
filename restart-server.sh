#!/bin/bash

echo "🔄 Reiniciando el servidor de desarrollo..."

# Detener cualquier proceso Next.js existente
echo "⏹️  Deteniendo procesos existentes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

# Esperar un momento
sleep 2

# Cambiar al directorio del proyecto
cd /workspaces/studio

# Verificar que estamos en el directorio correcto
echo "📁 Directorio actual: $(pwd)"

# Limpiar cache si existe
echo "🧹 Limpiando cache..."
rm -rf .next/cache 2>/dev/null || true

# Iniciar el servidor
echo "🚀 Iniciando servidor de desarrollo..."
npm run dev

echo "✅ Servidor iniciado!"
