import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = session.user.id;

    if (req.method === 'GET') {
      // Obtener datos de los últimos 7 días
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Generar array de los últimos 7 días
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        days.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }),
        });
      }

      // Obtener tareas completadas por día
      const completedTasksByDay = await Promise.all(
        days.map(async (day) => {
          const startOfDay = new Date(day.date + 'T00:00:00.000Z');
          const endOfDay = new Date(day.date + 'T23:59:59.999Z');
          
          const count = await prisma.task.count({
            where: {
              userId,
              status: 'done',
              updatedAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
          
          return {
            date: day.date,
            displayDate: day.displayDate,
            completed: count,
          };
        })
      );

      // Obtener tareas creadas por día
      const createdTasksByDay = await Promise.all(
        days.map(async (day) => {
          const startOfDay = new Date(day.date + 'T00:00:00.000Z');
          const endOfDay = new Date(day.date + 'T23:59:59.999Z');
          
          const count = await prisma.task.count({
            where: {
              userId,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
          
          return {
            date: day.date,
            displayDate: day.displayDate,
            created: count,
          };
        })
      );

      // Obtener eventos creados por día
      const eventsByDay = await Promise.all(
        days.map(async (day) => {
          const startOfDay = new Date(day.date + 'T00:00:00.000Z');
          const endOfDay = new Date(day.date + 'T23:59:59.999Z');
          
          const count = await prisma.event.count({
            where: {
              userId,
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          });
          
          return {
            date: day.date,
            displayDate: day.displayDate,
            events: count,
          };
        })
      );

      // Combinar datos para el gráfico
      const dailyActivity = days.map((day, index) => ({
        date: day.displayDate,
        completedTasks: completedTasksByDay[index]?.completed || 0,
        createdTasks: createdTasksByDay[index]?.created || 0,
        events: eventsByDay[index]?.events || 0,
      }));

      // Calcular estadísticas de resumen
      const totalCompletedThisWeek = completedTasksByDay.reduce((sum, day) => sum + day.completed, 0);
      const totalCreatedThisWeek = createdTasksByDay.reduce((sum, day) => sum + day.created, 0);
      const totalEventsThisWeek = eventsByDay.reduce((sum, day) => sum + day.events, 0);

      // Calcular promedio diario
      const avgTasksPerDay = totalCompletedThisWeek / 7;
      const avgEventsPerDay = totalEventsThisWeek / 7;

      // Calcular eficiencia (tareas completadas vs creadas)
      const completionRate = totalCreatedThisWeek > 0 ? (totalCompletedThisWeek / totalCreatedThisWeek) * 100 : 0;

      const productivity = {
        dailyActivity,
        summary: {
          totalCompletedThisWeek,
          totalCreatedThisWeek,
          totalEventsThisWeek,
          avgTasksPerDay: Math.round(avgTasksPerDay * 10) / 10,
          avgEventsPerDay: Math.round(avgEventsPerDay * 10) / 10,
          completionRate: Math.round(completionRate),
        },
      };

      res.status(200).json(productivity);
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Internal Server Error', errorDetails: error.toString() });
  }
}
