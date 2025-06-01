import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding dashboard data...');

  // Crear usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Usuario Demo',
    },
  });

  console.log('✅ Usuario creado:', user.email);

  // Crear tareas de prueba
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Revisar dashboard de Synergy Suite',
        description: 'Probar todas las funcionalidades del nuevo dashboard',
        status: 'completed',
        priority: 2, // High
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Ayer
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implementar nuevas métricas',
        description: 'Agregar métricas de productividad adicionales',
        status: 'in_progress',
        priority: 1, // Medium
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Optimizar rendimiento',
        description: 'Mejorar la velocidad de carga de los widgets',
        status: 'pending',
        priority: 0, // Low
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // En 1 semana
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Documentar APIs',
        description: 'Crear documentación completa de las APIs del dashboard',
        status: 'pending',
        priority: 1, // Medium
        userId: user.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Testing de integración',
        description: 'Probar la integración entre todos los módulos',
        status: 'completed',
        priority: 2, // High
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
        userId: user.id,
      },
    }),
  ]);

  console.log(`✅ ${tasks.length} tareas creadas`);

  // Crear eventos de prueba
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Reunión de equipo',
        description: 'Revisión semanal del progreso del proyecto',
        startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
        endDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // En 3 horas
        userId: user.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Demo del Dashboard',
        description: 'Presentación del nuevo dashboard a stakeholders',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
        endDate: new Date(Date.now() + 25 * 60 * 60 * 1000), // Mañana + 1 hora
        userId: user.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Workshop de productividad',
        description: 'Sesión de entrenamiento sobre las nuevas herramientas',
        startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // En 3 días
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // En 3 días + 2 horas
        userId: user.id,
      },
    }),
  ]);

  console.log(`✅ ${events.length} eventos creados`);

  // Crear documentos de prueba
  const docs = await Promise.all([
    prisma.doc.create({
      data: {
        title: 'Guía del Dashboard',
        ownerId: user.id,
      },
    }),
    prisma.doc.create({
      data: {
        title: 'Métricas de Productividad',
        ownerId: user.id,
      },
    }),
  ]);

  console.log(`✅ ${docs.length} documentos creados`);

  // Crear versiones de documentos para mostrar actividad reciente
  await Promise.all([
    prisma.docVersion.create({
      data: {
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Guía del Dashboard de Synergy Suite' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Este documento describe cómo usar el nuevo dashboard implementado en la Fase 7.',
                },
              ],
            },
          ],
        }),
        docId: docs[0].id,
        createdBy: user.id,
      },
    }),
    prisma.docVersion.create({
      data: {
        content: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Análisis de Métricas de Productividad' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Las métricas muestran un aumento del 25% en la productividad desde la implementación del dashboard.',
                },
              ],
            },
          ],
        }),
        docId: docs[1].id,
        createdBy: user.id,
      },
    }),
  ]);

  console.log('✅ Versiones de documentos creadas');
  console.log('🎉 Seed completo! El dashboard ahora tiene datos para mostrar.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
