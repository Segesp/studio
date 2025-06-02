// Test script para verificar el flujo de login
const http = require('http');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      resolve({
        status: res.statusCode,
        headers: res.headers,
        ok: res.statusCode >= 200 && res.statusCode < 300
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testLoginFlow() {
  console.log('🔍 Probando flujo de login...\n');
  
  // Test 1: Página de signin está disponible
  try {
    const response = await makeRequest('http://localhost:9002/auth/signin');
    if (response.ok) {
      console.log('✅ Página de signin accesible (HTTP ' + response.status + ')');
    } else {
      console.log('❌ Página de signin devolvió:', response.status);
      return;
    }
  } catch (error) {
    console.log('❌ Error al acceder a signin:', error.message);
    return;
  }

  // Test 2: Página principal está disponible
  try {
    const response = await makeRequest('http://localhost:9002/');
    if (response.ok) {
      console.log('✅ Página principal accesible (HTTP ' + response.status + ')');
    } else {
      console.log('❌ Página principal devolvió:', response.status);
    }
  } catch (error) {
    console.log('❌ Error al acceder a página principal:', error.message);
  }

  // Test 3: Dashboard sin autenticación (debería redirigir o devolver 401)
  try {
    const response = await makeRequest('http://localhost:9002/dashboard');
    console.log('📊 Dashboard sin auth devolvió:', response.status);
    if (response.status === 401 || response.status === 403) {
      console.log('✅ Dashboard correctamente protegido');
    } else if (response.status === 200) {
      console.log('⚠️  Dashboard accesible sin autenticación');
    } else if (response.status === 302 || response.status === 307) {
      console.log('✅ Dashboard redirige (probablemente a login)');
    }
  } catch (error) {
    console.log('❌ Error al acceder al dashboard:', error.message);
  }

  console.log('\n📝 Resumen:');
  console.log('- Para probar el login, ve a: http://localhost:9002/auth/signin');
  console.log('- Usa las credenciales: demo@example.com / demo');
  console.log('- Después del login exitoso, deberías ser redirigido a /dashboard');
  console.log('- Si no funciona la redirección, verifica la consola del navegador');
}

// Ejecutar las pruebas
testLoginFlow().catch(console.error);
