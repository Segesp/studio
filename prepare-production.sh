#!/bin/bash
# Script de preparación para producción - Synergy Suite
# Automatiza la configuración necesaria para despliegue

set -e

echo "🚀 PREPARANDO SYNERGY SUITE PARA PRODUCCIÓN"
echo "============================================="

# Función para generar NEXTAUTH_SECRET seguro
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -base64 32
    else
        # Fallback si openssl no está disponible
        cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
    fi
}

# Crear archivo de configuración de producción
echo "📝 Creando archivo de configuración de producción..."

cat > .env.production.template << 'EOF'
# VARIABLES DE ENTORNO PARA PRODUCCIÓN
# Copia este archivo a .env.production y configura los valores

# ===== CONFIGURACIÓN DE APLICACIÓN =====
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="GENERAR-SECRETO-FUERTE-32-CARACTERES"

# ===== BASE DE DATOS =====
# Para PostgreSQL (recomendado para producción)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Para SQLite (solo para pruebas)
# DATABASE_URL="file:./prod.db"

# ===== PROVEEDORES OAUTH (OPCIONAL) =====
GITHUB_ID=""
GITHUB_SECRET=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ===== IA Y SMART-ASSIST =====
GOOGLE_API_KEY="tu-clave-api-de-google"

# ===== CONFIGURACIÓN ADICIONAL =====
NODE_ENV="production"
PORT="3000"

# ===== MONITOREO Y LOGS =====
ENABLE_ANALYTICS="true"
LOG_LEVEL="info"
EOF

echo "✅ Archivo .env.production.template creado"

# Generar secreto de ejemplo
SECRET=$(generate_secret)
echo "🔐 Secreto generado para NEXTAUTH_SECRET: $SECRET"

# Crear script de build para producción
echo "📦 Creando script de build para producción..."

cat > build-production.sh << 'EOF'
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
npm ci --only=production

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
EOF

chmod +x build-production.sh
echo "✅ Script build-production.sh creado"

# Crear script de deploy
echo "🚀 Creando script de deploy..."

cat > deploy.sh << 'EOF'
#!/bin/bash
# Script de despliegue para diferentes plataformas

set -e

PLATFORM=${1:-"manual"}

echo "🚀 DESPLEGANDO SYNERGY SUITE"
echo "============================="
echo "Plataforma: $PLATFORM"

case $PLATFORM in
    "vercel")
        echo "📡 Desplegando en Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "❌ Vercel CLI no está instalado"
            echo "💡 Instalar con: npm i -g vercel"
            exit 1
        fi
        ;;
    "railway")
        echo "🚂 Desplegando en Railway..."
        if command -v railway &> /dev/null; then
            railway up
        else
            echo "❌ Railway CLI no está instalado"
            echo "💡 Instalar con: npm i -g @railway/cli"
            exit 1
        fi
        ;;
    "docker")
        echo "🐳 Construyendo imagen Docker..."
        docker build -t synergy-suite .
        echo "✅ Imagen Docker creada: synergy-suite"
        ;;
    "manual")
        echo "📋 INSTRUCCIONES DE DESPLIEGUE MANUAL:"
        echo "1. Configurar variables de entorno en tu servidor"
        echo "2. Ejecutar: ./build-production.sh"
        echo "3. Iniciar con: npm start o PM2"
        echo "4. Configurar proxy reverso (Nginx/Apache)"
        echo "5. Configurar SSL/TLS"
        ;;
    *)
        echo "❌ Plataforma no soportada: $PLATFORM"
        echo "💡 Plataformas disponibles: vercel, railway, docker, manual"
        exit 1
        ;;
esac

echo "✅ Proceso de despliegue completado"
EOF

chmod +x deploy.sh
echo "✅ Script deploy.sh creado"

# Crear Dockerfile para containerización
echo "🐳 Creando Dockerfile..."

cat > Dockerfile << 'EOF'
# Dockerfile para Synergy Suite
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basado en el gestor de paquetes preferido
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Copiar archivos de build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF

echo "✅ Dockerfile creado"

# Crear .dockerignore
cat > .dockerignore << 'EOF'
.git
.gitignore
README.md
Dockerfile
.dockerignore
.next
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
.vercel
**/.git
**/.DS_Store
**/node_modules
**/npm-debug.log*
docs/
scripts/
test-*.js
test-*.sh
*.test.*
coverage/
.nyc_output/
EOF

echo "✅ .dockerignore creado"

# Crear archivo de healthcheck
echo "🏥 Creando healthcheck..."

cat > healthcheck.js << 'EOF'
// Healthcheck para monitoreo de aplicación
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Aplicación saludable');
    process.exit(0);
  } else {
    console.log('❌ Aplicación no responde correctamente');
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('❌ Error en healthcheck:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Timeout en healthcheck');
  req.destroy();
  process.exit(1);
});

req.end();
EOF

echo "✅ healthcheck.js creado"

# Actualizar package.json con scripts de producción
echo "📝 Agregando scripts de producción a package.json..."

# Usar Node.js para agregar scripts sin sobreescribir
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts = pkg.scripts || {};
pkg.scripts['build:prod'] = './build-production.sh';
pkg.scripts['deploy'] = './deploy.sh';
pkg.scripts['health'] = 'node healthcheck.js';
pkg.scripts['start:prod'] = 'NODE_ENV=production npm start';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Scripts agregados a package.json');
"

echo ""
echo "🎉 PREPARACIÓN PARA PRODUCCIÓN COMPLETADA"
echo "========================================="
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Copiar .env.production.template a .env.production"
echo "2. Configurar variables de entorno en .env.production"
echo "3. Ejecutar: ./build-production.sh"
echo "4. Desplegar con: ./deploy.sh [plataforma]"
echo ""
echo "📚 DOCUMENTACIÓN:"
echo "• Guía completa: docs/production-setup.md"
echo "• NEXTAUTH_SECRET generado: $SECRET"
echo ""
echo "🚀 PLATAFORMAS DE DESPLIEGUE SOPORTADAS:"
echo "• Vercel: ./deploy.sh vercel"
echo "• Railway: ./deploy.sh railway"
echo "• Docker: ./deploy.sh docker"
echo "• Manual: ./deploy.sh manual"
EOF

chmod +x prepare-production.sh
echo "✅ Script prepare-production.sh creado"
