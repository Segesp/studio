# Synergy Suite - Production Deployment Guide

## Overview
This guide covers the complete production deployment setup for Synergy Suite, including database optimization, security hardening, CI/CD pipeline configuration, and monitoring.

## Pre-deployment Checklist

### 1. Environment Variables
Ensure all production environment variables are set:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:5432/synergy_suite_prod"

# Authentication
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-super-secure-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI/Genkit (if using)
GOOGLE_GENAI_API_KEY="your-genai-api-key"

# Additional Security
NODE_ENV="production"
```

### 2. Database Setup

#### PostgreSQL Production Configuration
```sql
-- Create production database
CREATE DATABASE synergy_suite_prod;
CREATE USER synergy_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE synergy_suite_prod TO synergy_user;

-- Performance optimizations
ALTER DATABASE synergy_suite_prod SET shared_preload_libraries = 'pg_stat_statements';
ALTER DATABASE synergy_suite_prod SET log_statement = 'all';
ALTER DATABASE synergy_suite_prod SET log_min_duration_statement = 1000;
```

#### Prisma Production Migration
```bash
# Generate Prisma client for production
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed production data (optional)
npx prisma db seed
```

### 3. Security Hardening

#### HTTPS/SSL Configuration
- Use SSL certificates (Let's Encrypt recommended)
- Configure HTTPS redirects
- Set security headers

#### CSP (Content Security Policy)
```javascript
// next.config.ts - Add security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

### 4. Performance Optimizations

#### Next.js Production Build
```json
// package.json - Production scripts
{
  "scripts": {
    "build:prod": "NODE_ENV=production next build",
    "start:prod": "NODE_ENV=production next start -p 3000",
    "analyze": "ANALYZE=true npm run build:prod"
  }
}
```

#### Database Connection Pooling
```typescript
// lib/prisma.ts - Production configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Connection pooling for production
if (process.env.NODE_ENV === 'production') {
  prisma.$connect()
}
```

## Deployment Platforms

### 1. Vercel Deployment (Recommended)

#### Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### vercel.json Configuration
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build:prod",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  },
  "regions": ["iad1", "fra1"],
  "functions": {
    "src/pages/api/**": {
      "maxDuration": 30
    }
  }
}
```

### 2. Docker Production Setup

#### Dockerfile.prod
```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build:prod

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
```

#### docker-compose.prod.yml
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: synergy_suite_prod
      POSTGRES_USER: synergy_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 3. AWS/Railway/DigitalOcean Setup

#### Environment Configuration
```bash
# Railway
railway add
railway link
railway up

# AWS (using AWS CLI)
aws configure
aws elasticbeanstalk create-application --application-name synergy-suite

# DigitalOcean App Platform
doctl apps create --spec .do/app.yaml
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build:prod
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring & Logging

### 1. Application Monitoring

#### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

#### Performance Monitoring
```typescript
// lib/analytics.ts
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log('Event tracked:', eventName, properties)
  }
}
```

### 2. Database Monitoring

#### PostgreSQL Monitoring
```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

### 3. Health Checks

#### API Health Endpoint
```typescript
// pages/api/health.ts
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  }
  
  try {
    res.status(200).json(healthcheck)
  } catch (error) {
    healthcheck.message = error
    res.status(503).json(healthcheck)
  }
}
```

## Backup & Recovery

### 1. Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "$BACKUP_DIR/synergy_suite_$DATE.sql"

# Keep only last 7 days
find $BACKUP_DIR -name "synergy_suite_*.sql" -mtime +7 -delete
```

### 2. File Backups
```bash
# Backup uploaded files (if any)
aws s3 sync /app/uploads s3://synergy-suite-backups/uploads/
```

## Post-Deployment Checklist

### 1. Functional Testing
- [ ] User authentication works
- [ ] Dashboard loads correctly
- [ ] Task management functions
- [ ] Calendar integration works
- [ ] Real-time features function
- [ ] AI features respond correctly

### 2. Performance Testing
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Memory usage stable

### 3. Security Testing
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation working

### 4. Monitoring Setup
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Health checks responding
- [ ] Backup procedures tested

## Maintenance

### 1. Regular Updates
```bash
# Weekly dependency updates
npm audit
npm update
npm run test

# Monthly security updates
npm audit fix
```

### 2. Database Maintenance
```sql
-- Weekly database maintenance
VACUUM ANALYZE;
REINDEX DATABASE synergy_suite_prod;
```

### 3. Log Rotation
```bash
# Configure logrotate for application logs
/var/log/synergy-suite/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
}
```

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancers (AWS ALB, Cloudflare)
- Implement session store (Redis)
- CDN for static assets

### 2. Database Scaling
- Read replicas for query optimization
- Connection pooling (PgBouncer)
- Database partitioning for large datasets

### 3. Caching Strategy
- Redis for session storage
- Next.js static generation
- CDN caching for assets

## Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Check connection string format
   - Verify database server status
   - Check firewall rules

2. **Authentication Issues**
   - Verify OAuth configuration
   - Check NEXTAUTH_URL setting
   - Validate JWT secret

3. **Performance Issues**
   - Monitor database queries
   - Check memory usage
   - Analyze bundle size

### Support Contacts
- Development Team: dev@synergy-suite.com
- DevOps Team: devops@synergy-suite.com
- Emergency: +1-555-SUPPORT
