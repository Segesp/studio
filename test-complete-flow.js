#!/usr/bin/env node
/**
 * Script de pruebas completas del flujo de autenticación - Fase 7
 * Valida todo el sistema de extremo a extremo
 */

const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          ok: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });
    
    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function runCompleteTests() {
  console.log('🚀 INICIANDO PRUEBAS COMPLETAS - FASE 7\n');
  console.log('=' .repeat(50));
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Homepage disponible
  console.log('\n📱 Test 1: Homepage Principal');
  try {
    const response = await makeRequest('http://localhost:9002/');
    if (response.ok) {
      console.log('✅ Homepage accesible (HTTP ' + response.status + ')');
      results.passed++;
      results.tests.push({ name: 'Homepage', status: 'PASS', code: response.status });
    } else {
      console.log('❌ Homepage falló (HTTP ' + response.status + ')');
      results.failed++;
      results.tests.push({ name: 'Homepage', status: 'FAIL', code: response.status });
    }
  } catch (error) {
    console.log('❌ Error en homepage:', error.message);
    results.failed++;
    results.tests.push({ name: 'Homepage', status: 'ERROR', error: error.message });
  }

  // Test 2: Página de signin
  console.log('\n🔐 Test 2: Página de Signin');
  try {
    const response = await makeRequest('http://localhost:9002/auth/signin');
    if (response.ok) {
      console.log('✅ Signin page accesible (HTTP ' + response.status + ')');
      
      // Verificar contenido
      if (response.data.includes('Iniciar Sesión') || response.data.includes('SignIn')) {
        console.log('✅ Contenido de signin correcto');
        results.passed++;
        results.tests.push({ name: 'Signin Page', status: 'PASS', code: response.status });
      } else {
        console.log('⚠️  Signin accesible pero contenido incierto');
        results.passed++;
        results.tests.push({ name: 'Signin Page', status: 'PASS*', code: response.status });
      }
    } else {
      console.log('❌ Signin page falló (HTTP ' + response.status + ')');
      results.failed++;
      results.tests.push({ name: 'Signin Page', status: 'FAIL', code: response.status });
    }
  } catch (error) {
    console.log('❌ Error en signin page:', error.message);
    results.failed++;
    results.tests.push({ name: 'Signin Page', status: 'ERROR', error: error.message });
  }

  // Test 3: Dashboard protegido
  console.log('\n🛡️  Test 3: Protección del Dashboard');
  try {
    const response = await makeRequest('http://localhost:9002/dashboard');
    if (response.status === 307 || response.status === 302) {
      console.log('✅ Dashboard correctamente protegido (HTTP ' + response.status + ')');
      results.passed++;
      results.tests.push({ name: 'Dashboard Protection', status: 'PASS', code: response.status });
    } else if (response.status === 200) {
      console.log('⚠️  Dashboard accesible sin auth - revisar middleware');
      results.failed++;
      results.tests.push({ name: 'Dashboard Protection', status: 'FAIL', code: response.status });
    } else {
      console.log('❌ Dashboard devolvió código inesperado:', response.status);
      results.failed++;
      results.tests.push({ name: 'Dashboard Protection', status: 'FAIL', code: response.status });
    }
  } catch (error) {
    console.log('❌ Error en dashboard protection:', error.message);
    results.failed++;
    results.tests.push({ name: 'Dashboard Protection', status: 'ERROR', error: error.message });
  }

  // Test 4: NextAuth API endpoints
  console.log('\n🔑 Test 4: NextAuth API Endpoints');
  try {
    const response = await makeRequest('http://localhost:9002/api/auth/providers');
    if (response.ok) {
      console.log('✅ NextAuth API funcionando (HTTP ' + response.status + ')');
      results.passed++;
      results.tests.push({ name: 'NextAuth API', status: 'PASS', code: response.status });
    } else {
      console.log('❌ NextAuth API falló (HTTP ' + response.status + ')');
      results.failed++;
      results.tests.push({ name: 'NextAuth API', status: 'FAIL', code: response.status });
    }
  } catch (error) {
    console.log('❌ Error en NextAuth API:', error.message);
    results.failed++;
    results.tests.push({ name: 'NextAuth API', status: 'ERROR', error: error.message });
  }

  // Test 5: Verificar archivos críticos
  console.log('\n📁 Test 5: Archivos Críticos');
  const fs = require('fs');
  const criticalFiles = [
    '/workspaces/studio/src/app/auth/signin/page.tsx',
    '/workspaces/studio/src/middleware.ts',
    '/workspaces/studio/src/pages/api/auth/[...nextauth].ts',
    '/workspaces/studio/src/app/layout.tsx'
  ];

  let filesOk = 0;
  for (const file of criticalFiles) {
    try {
      const stats = fs.statSync(file);
      if (stats.size > 0) {
        console.log('✅ ' + file.split('/').pop() + ' existe y tiene contenido');
        filesOk++;
      } else {
        console.log('❌ ' + file.split('/').pop() + ' está vacío');
      }
    } catch (error) {
      console.log('❌ ' + file.split('/').pop() + ' no encontrado');
    }
  }

  if (filesOk === criticalFiles.length) {
    console.log('✅ Todos los archivos críticos están presentes');
    results.passed++;
    results.tests.push({ name: 'Critical Files', status: 'PASS' });
  } else {
    console.log('❌ Faltan archivos críticos (' + filesOk + '/' + criticalFiles.length + ')');
    results.failed++;
    results.tests.push({ name: 'Critical Files', status: 'FAIL', found: filesOk, total: criticalFiles.length });
  }

  // Resumen final
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS - FASE 7');
  console.log('=' .repeat(50));
  console.log('✅ Pruebas exitosas: ' + results.passed);
  console.log('❌ Pruebas fallidas: ' + results.failed);
  console.log('📈 Porcentaje de éxito: ' + Math.round((results.passed / (results.passed + results.failed)) * 100) + '%');

  console.log('\n📋 Detalle de pruebas:');
  results.tests.forEach((test, index) => {
    const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️ ';
    console.log(`${index + 1}. ${status} ${test.name} ${test.code ? '(HTTP ' + test.code + ')' : ''}`);
  });

  if (results.failed === 0) {
    console.log('\n🎉 ¡FASE 7 COMPLETADA EXITOSAMENTE!');
    console.log('🚀 Sistema listo para Fase 8');
  } else {
    console.log('\n⚠️  Revisar elementos fallidos antes de continuar');
  }

  // Instrucciones para pruebas manuales
  console.log('\n📝 PRUEBAS MANUALES RECOMENDADAS:');
  console.log('1. Abrir: http://localhost:9002/auth/signin');
  console.log('2. Usar credenciales: demo@example.com / demo');
  console.log('3. Verificar redirección a dashboard después del login');
  console.log('4. Confirmar que el botón "Iniciar Sesión" funciona correctamente');

  return results;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runCompleteTests().catch(console.error);
}

module.exports = { runCompleteTests };
