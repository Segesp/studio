#!/bin/bash
# Script simple de verificación del estado de la Fase 7

echo "🔍 VERIFICACIÓN RÁPIDA - FASE 7"
echo "================================="

# Test 1: Homepage
echo -n "📱 Homepage (puerto 9002): "
if curl -s -o /dev/null -w "%{http_code}" http://localhost:9002 | grep -q "200"; then
    echo "✅ PASS (HTTP 200)"
else
    echo "❌ FAIL"
fi

# Test 2: Signin page
echo -n "🔐 Signin page: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/auth/signin)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS (HTTP 200)"
else
    echo "❌ FAIL (HTTP $STATUS)"
fi

# Test 3: Dashboard protection
echo -n "🛡️  Dashboard protection: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/dashboard)
if [ "$STATUS" = "307" ] || [ "$STATUS" = "302" ]; then
    echo "✅ PASS (HTTP $STATUS - Redirigido)"
elif [ "$STATUS" = "200" ]; then
    echo "⚠️  WARNING (HTTP 200 - Sin protección)"
else
    echo "❌ FAIL (HTTP $STATUS)"
fi

# Test 4: NextAuth API
echo -n "🔑 NextAuth API: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9002/api/auth/providers)
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS (HTTP 200)"
else
    echo "❌ FAIL (HTTP $STATUS)"
fi

# Test 5: Archivos críticos
echo "📁 Archivos críticos:"
FILES=(
    "src/app/auth/signin/page.tsx"
    "src/middleware.ts"
    "src/pages/api/auth/[...nextauth].ts"
    "src/app/layout.tsx"
)

for file in "${FILES[@]}"; do
    echo -n "   • $file: "
    if [ -f "$file" ] && [ -s "$file" ]; then
        echo "✅ OK"
    else
        echo "❌ MISSING/EMPTY"
    fi
done

echo ""
echo "🚀 Estado del servidor:"
echo "   • Puerto 9002: $(netstat -tlnp 2>/dev/null | grep :9002 | wc -l) proceso(s) activo(s)"

echo ""
echo "📝 Para pruebas manuales:"
echo "   1. Ir a: http://localhost:9002/auth/signin"
echo "   2. Credenciales: demo@example.com / demo"
echo "   3. Verificar redirección al dashboard"
