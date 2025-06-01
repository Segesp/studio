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
      // Obtener estadísticas de tareas
      const taskStats = await prisma.task.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      });

      const totalTasks = taskStats.reduce((sum, stat) => sum + stat._count.id, 0);
      const completedTasks = taskStats.find(stat => stat.status === 'done')?._count.id || 0;
      const pendingTasks = taskStats.find(stat => stat.status === 'pending')?._count.id || 0;
      
      // Obtener tareas vencidas
      const overdueTasks = await prisma.task.count({
        where: {
          userId,
          status: { not: 'done' },
          dueDate: { lt: new Date() },
        },
      });

      // Obtener estadísticas de eventos
      const totalEvents = await prisma.event.count({
        where: { userId },
      });

      const upcomingEvents = await prisma.event.count({
        where: {
          userId,
          startDate: { gte: new Date() },
        },
      });

      // Obtener total de documentos
      const totalDocs = await prisma.doc.count({
        where: { ownerId: userId },
      });

      // Obtener actividad reciente (últimas 10 acciones)
      const recentTasks = await prisma.task.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      const recentEvents = await prisma.event.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      const recentDocs = await prisma.doc.findMany({
        where: { ownerId: userId },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          updatedAt: true,
          createdAt: true,
        },
      });

      // Combinar y formatear actividad reciente
      const recentActivity = [
        ...recentTasks.map(task => {
          const action: 'created' | 'updated' = task.updatedAt.getTime() === task.createdAt.getTime() ? 'created' : 'updated';
          return {
            id: task.id,
            type: 'task' as const,
            action,
            title: task.title,
            timestamp: task.updatedAt.toISOString(),
          };
        }),
        ...recentEvents.map(event => {
          const action: 'created' | 'updated' = event.updatedAt.getTime() === event.createdAt.getTime() ? 'created' : 'updated';
          return {
            id: event.id,
            type: 'event' as const,
            action,
            title: event.title,
            timestamp: event.updatedAt.toISOString(),
          };
        }),
        ...recentDocs.map(doc => {
          const action: 'created' | 'updated' = doc.updatedAt.getTime() === doc.createdAt.getTime() ? 'created' : 'updated';
          return {
            id: doc.id,
            type: 'doc' as const,
            action,
            title: doc.title,
            timestamp: doc.updatedAt.toISOString(),
          };
        }),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      const stats = {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalEvents,
        upcomingEvents,
        totalDocs,
        recentActivity,
      };

      res.status(200).json(stats);
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
