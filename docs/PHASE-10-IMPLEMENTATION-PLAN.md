# Fase 10. Despliegue y entrega

**Objetivo**: Preparar y automatizar el despliegue en producción, asegurando escalabilidad, monitorización, seguridad y recuperación.

### Tareas

1. Configurar contenedores Docker
   - Crear `Dockerfile.backend` para build y runtime en modo producción.
   - Crear `Dockerfile.frontend` para Next.js estático servido por Nginx.
   - Verificar localmente con `docker build` y `docker run`.

2. Definir `docker-compose.yml`
   - Servicios: `db` (PostgreSQL), `redis`, `yjs-server` (colaboración), `backend`, `frontend`.
   - Variables de entorno seguras en un `.env.production`.
   - Iniciar stack completo y validar conectividad entre contenedores.

3. Implementar CI/CD con GitHub Actions
   - Workflow `ci.yml`: lint, tests, build.
   - Workflow `cd.yml` (o etapa posterior): build de imágenes, push a registry, despliegue automatizado (DockerHub, AWS ECR, etc.).
   - Configurar secrets: `DOCKERHUB_USER`, `DOCKERHUB_TOKEN`, `OPENAI_API_KEY`, `DATABASE_URL`, etc.

4. Monitorización y logging
   - Integrar Sentry en frontend y backend para captura de errores.
   - Configurar logs de servidor en un servicio externo (Datadog, Loggly, Papertrail).
   - Definir alertas para errores críticos y métricas de latencia.

5. Backups y recuperación
   - Programar snapshots periódicos de la base de datos (p. ej. RDS o script en Docker).
   - Configurar backup de Redis (AOF/RDB) y rotación.
   - Documentar proceso de restauración de datos.

6. Seguridad y HTTPS
   - Configurar certificado TLS con Let’s Encrypt (certbot) o servicio gestionado.
   - Forzar redirección HTTP → HTTPS en Nginx.
   - Revisar headers de seguridad (CSP, HSTS, XSS Protection).

7. Documentación final
   - Actualizar `README.md` con pasos de despliegue en producción.
   - Crear sección en `docs/production-deployment-guide.md` con: estructuras de carpetas, comandos útiles, variables necesarias.
   - Incluir diagrama arquitectónico en `docs/blueprint.md`.

> **Criterio de aceptación**:
>
> - `docker-compose up --build -d` inicia todos los servicios sin errores.
> - CI/CD corre automáticamente en cada push a `main`, construye imágenes y las publica.
> - El dominio de producción carga en HTTPS sin warnings ni placeholders.
> - Existe plan documentado de monitorización, alertas y backups.
