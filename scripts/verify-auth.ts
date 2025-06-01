// Script de verificación de autenticación
// Este script verifica que la configuración de NextAuth esté funcionando correctamente

import { authOptions } from '../src/pages/api/auth/[...nextauth]';
import { prisma } from '../src/lib/prisma';

async function verifyAuthSetup() {
  console.log('🔍 Verificando configuración de autenticación...\n');

  // 1. Verificar conexión a base de datos
  try {
    await prisma.$connect();
    console.log('✅ Conexión a base de datos: OK');
  } catch (error) {
    console.log('❌ Error de conexión a base de datos:', error);
    return;
  }

  // 2. Verificar tablas de NextAuth
  try {
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('Account', 'Session', 'User', 'VerificationToken');
    ` as Array<{name: string}>;
    
    const expectedTables = ['Account', 'Session', 'User', 'VerificationToken'];
    const foundTables = tables.map(t => t.name);
    
    console.log('📊 Tablas encontradas:', foundTables);
    
    for (const table of expectedTables) {
      if (foundTables.includes(table)) {
        console.log(`✅ Tabla ${table}: OK`);
      } else {
        console.log(`❌ Tabla ${table}: FALTANTE`);
      }
    }
  } catch (error) {
    console.log('❌ Error verificando tablas:', error);
  }

  // 3. Verificar usuario demo
  try {
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@example.com' }
    });

    if (demoUser) {
      console.log('✅ Usuario demo encontrado:', demoUser.email);
    } else {
      console.log('⚠️  Usuario demo no encontrado, se creará en el primer login');
    }
  } catch (error) {
    console.log('❌ Error verificando usuario demo:', error);
  }

  // 4. Verificar variables de entorno
  const envVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  console.log('\n🔧 Variables de entorno:');
  for (const envVar of envVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar === 'NEXTAUTH_SECRET' ? '[REDACTED]' : value}`);
    } else {
      console.log(`❌ ${envVar}: NO CONFIGURADA`);
    }
  }

  // 5. Verificar configuración de NextAuth
  console.log('\n⚙️  Configuración NextAuth:');
  console.log(`✅ Providers configurados: ${authOptions.providers?.length || 0}`);
  console.log(`✅ Session strategy: ${authOptions.session?.strategy || 'default'}`);
  console.log(`✅ Páginas personalizadas: ${authOptions.pages ? 'Sí' : 'No'}`);

  await prisma.$disconnect();
  console.log('\n🎉 Verificación completada!');
}

verifyAuthSetup().catch(console.error);
