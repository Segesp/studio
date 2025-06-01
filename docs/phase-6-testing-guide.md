# 🧪 Guía de Pruebas - Fase 6: Sincronización en Tiempo Real

## 📋 Lista de Pruebas para Verificar Funcionalidad

### 🔌 Pruebas de Conexión WebSocket

1. **Verificar Estado de Conexión**
   - [ ] Abrir la aplicación en dos pestañas/ventanas
   - [ ] Verificar que el indicador de conexión muestre "Conectado" en ambas
   - [ ] Navegar a Task List y Calendar en ambas ventanas
   - [ ] Confirmar que los indicadores de estado se mantienen verdes

### ✅ Pruebas de Sincronización de Tareas

2. **Crear Nueva Tarea**
   - [ ] En la ventana A: Navegar a Task List
   - [ ] Crear una nueva tarea con título "Prueba Sync 1"
   - [ ] En la ventana B: Verificar que la tarea aparezca automáticamente
   - [ ] Verificar que aparezca una notificación en tiempo real

3. **Editar Tarea Existente**
   - [ ] En la ventana B: Editar la tarea creada, cambiar título a "Prueba Sync 1 - Editada"
   - [ ] En la ventana A: Verificar que el cambio se refleje automáticamente
   - [ ] Verificar notificación de actualización

4. **Eliminar Tarea**
   - [ ] En la ventana A: Eliminar la tarea editada
   - [ ] En la ventana B: Verificar que la tarea desaparezca automáticamente
   - [ ] Verificar notificación de eliminación

### 📅 Pruebas de Sincronización de Calendario

5. **Crear Nuevo Evento**
   - [ ] En la ventana A: Navegar a Interactive Calendar
   - [ ] Crear un nuevo evento para hoy con título "Evento Sync Test"
   - [ ] En la ventana B: Verificar que el evento aparezca en el calendario
   - [ ] Verificar notificación en tiempo real

6. **Mover Evento (Drag & Drop)**
   - [ ] En la ventana B: Arrastrar el evento a una fecha diferente
   - [ ] En la ventana A: Verificar que el evento se mueva automáticamente
   - [ ] Verificar notificación de actualización

7. **Editar Evento**
   - [ ] En la ventana A: Editar el evento, cambiar título y descripción
   - [ ] En la ventana B: Verificar que los cambios se reflejen
   - [ ] Verificar notificación

8. **Eliminar Evento**
   - [ ] En la ventana B: Eliminar el evento de prueba
   - [ ] En la ventana A: Verificar que el evento desaparezca
   - [ ] Verificar notificación de eliminación

### 🔔 Pruebas de Sistema de Notificaciones

9. **Verificar Notificaciones en Header**
   - [ ] Realizar cambios en una ventana
   - [ ] En la otra ventana: Verificar que aparezca el badge de notificaciones
   - [ ] Hacer clic en el icono de notificaciones
   - [ ] Verificar que el popover muestre las notificaciones recientes
   - [ ] Probar "Dismiss" en notificaciones individuales
   - [ ] Probar "Clear All" para limpiar todas las notificaciones

### 🔄 Pruebas de Reconexión

10. **Simular Desconexión**
    - [ ] Abrir DevTools y desactivar la red
    - [ ] Verificar que el indicador cambie a "Desconectado"
    - [ ] Reactivar la red
    - [ ] Verificar reconexión automática
    - [ ] Probar que los cambios se sincronicen después de la reconexión

### 📄 Pruebas de Documentos Colaborativos (Verificación)

11. **Verificar Que No se Afectó la Funcionalidad Existente**
    - [ ] Abrir Collaborative Docs en dos ventanas
    - [ ] Verificar que la edición simultánea siga funcionando
    - [ ] Verificar cursor awareness
    - [ ] Confirmar guardado automático

### 🎨 Pruebas de UI/UX

12. **Verificar Interfaz de Usuario**
    - [ ] Verificar que los indicadores de conexión sean visibles y claros
    - [ ] Confirmar que las notificaciones no interfieran con la navegación
    - [ ] Verificar responsive design en diferentes tamaños de pantalla
    - [ ] Probar navegación entre páginas con WebSocket activo

## 🚨 Casos de Error Esperados

### Errores que DEBERÍAN Manejarse Correctamente:
- [ ] Pérdida de conexión a internet
- [ ] Cierre abrupto del navegador
- [ ] Cambios simultáneos al mismo elemento
- [ ] Navegación rápida entre páginas

### Errores que NO Deberían Ocurrir:
- [ ] Duplicación de tareas/eventos
- [ ] Pérdida de datos después de reconexión
- [ ] Interferencia entre notificaciones de diferentes tipos
- [ ] Memory leaks por listeners no limpiados

## ✅ Criterios de Éxito

La Fase 6 se considera exitosa si:

1. **Funcionalidad Core**: Todas las pruebas básicas de sincronización pasan
2. **Performance**: No hay lag notable en la sincronización (< 500ms)
3. **Estabilidad**: No hay errores en consola durante uso normal
4. **UX**: Las notificaciones son útiles y no intrusivas
5. **Robustez**: El sistema maneja desconexiones/reconexiones correctamente

## 🔧 Debug y Troubleshooting

### Comandos Útiles para Debug:
```bash
# Verificar servidor WebSocket
npm run dev

# Verificar logs de browser
# Abrir DevTools > Console
# Buscar mensajes WebSocket y errores

# Verificar network tab para WebSocket connections
# DevTools > Network > WS filter
```

### Logs Esperados en Console:
- ✅ "WebSocket connected"
- ✅ "Task sync initialized"
- ✅ "Calendar sync initialized"  
- ✅ "Received task-updated event"
- ✅ "Received event-created event"

---
*Guía de pruebas para verificar funcionalidad de Fase 6*
*Ejecutar estas pruebas antes de proceder a Fase 7*
