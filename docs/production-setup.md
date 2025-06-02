# Guía de Configuración de Producción - Synergy Suite

## Variables de Entorno Requeridas

Para desplegar Synergy Suite en producción, necesitas configurar las siguientes variables de entorno:

### 🔐 Autenticación (NextAuth)
```bash
# URL base de tu aplicación en producción
NEXTAUTH_URL="https://tu-dominio.com"

# Secreto para firmar tokens JWT (generar uno fuerte)
NEXTAUTH_SECRET="tu-secreto-super-fuerte-de-32-caracteres-minimo"

# Si usas GitHub OAuth (opcional)
GITHUB_ID="tu-github-app-id"
GITHUB_SECRET="tu-github-app-secret"
```

### 🗄️ Base de Datos
```bash
# Para PostgreSQL en producción (recomendado)
DATABASE_URL="postgresql://username:password@host:port/database"

# Para SQLite (solo desarrollo/pruebas)
DATABASE_URL="file:./prod.db"
```

### 🤖 IA y Smart-Assist
```bash
# Clave API de Google AI Studio
GOOGLE_API_KEY="tu-clave-api-de-google"
```

## 🚀 Pasos de Despliegue

### 1. Preparar la base de datos
```bash
# Ejecutar migraciones
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate
```

### 2. Compilar la aplicación
```bash
# Instalar dependencias
npm ci

# Compilar para producción
npm run build
```

### 3. Iniciar en producción
```bash
# Método 1: PM2 (recomendado)
npm install -g pm2
pm2 start npm --name "synergy-suite" -- start

# Método 2: Directo
npm start
```

## 🔒 Consideraciones de Seguridad

1. **NEXTAUTH_SECRET**: Debe ser único y fuerte (mínimo 32 caracteres)
2. **DATABASE_URL**: Usar conexiones SSL en producción
3. **Variables de entorno**: Nunca commitear claves en el repositorio
4. **CORS**: Configurar dominios permitidos
5. **HTTPS**: Usar siempre SSL/TLS en producción

## 📊 Monitoreo

- Los logs están disponibles en la consola del servidor
- Métricas de rendimiento via Next.js Analytics
- Errores capturados via middleware personalizado

## 🌐 Plataformas Recomendadas

### Vercel (Recomendado)
- Configuración automática para Next.js
- Variables de entorno via dashboard
- Dominio personalizado incluido

### Railway
- Base de datos PostgreSQL incluida
- Despliegue automático desde Git
- Escalado automático

### DigitalOcean App Platform
- Control completo del servidor
- Base de datos administrada disponible
- Precios predecibles

## 🔧 Configuración Específica por Plataforma

### Vercel
1. Conectar repositorio en vercel.com
2. Configurar variables de entorno en Settings
3. Configurar dominio personalizado
4. Deploy automático en cada push

### Railway
1. Conectar GitHub en railway.app
2. Agregar servicio PostgreSQL
3. Configurar variables de entorno
4. Deploy automático

## 📝 Checklist Pre-Despliegue

- [ ] Variables de entorno configuradas
- [ ] Base de datos configurada y migrada
- [ ] Compilación exitosa (`npm run build`)
- [ ] Pruebas pasando (`npm test`)
- [ ] Dominio configurado
- [ ] SSL/HTTPS activo
- [ ] Monitoreo configurado

## 🆘 Solución de Problemas

### Error: "NEXTAUTH_SECRET is not defined"
```bash
# Generar un secret fuerte
openssl rand -base64 32
```

### Error de conexión a base de datos
- Verificar URL de conexión
- Comprobar permisos de red
- Verificar credenciales

### Problemas de autenticación
- Verificar NEXTAUTH_URL coincide con dominio
- Comprobar configuración de proveedores OAuth
- Revisar logs del servidor

## 📞 Soporte

Para soporte adicional:
1. Revisar logs del servidor
2. Consultar documentación de Next.js
3. Verificar configuración de NextAuth
4. Contactar al equipo de desarrollo
