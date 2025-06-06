
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Task } from '@prisma/client';

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
      const { status, limit: limitQuery, sort } = req.query;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : undefined;

      // Determinar el orden basado en el parámetro sort
      let orderBy: any = { dueDate: 'asc' }; // Por defecto
      if (sort === 'recent') {
        orderBy = { updatedAt: 'desc' };
      } else if (sort === 'created') {
        orderBy = { createdAt: 'desc' };
      } else if (sort === 'priority') {
        orderBy = { priority: 'desc' };
      }

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          ...(status && { status: status as string }),
        },
        orderBy,
        take: limit,
      });
      res.status(200).json(tasks);
    } else if (req.method === 'POST') {
      const { title, description, dueDate, priority, tags, status } = req.body as {
        title?: string;
        description?: string;
        dueDate?: string | Date;
        priority?: number;
        tags?: string | string[];
        status?: string;
      };
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority !== undefined ? Number(priority) : 0,
          tags: typeof tags === 'string' ? tags : (Array.isArray(tags) ? tags.join(',') : null),
          status: status || 'pending',
          userId,
        },
      });
      res.status(201).json(newTask);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Internal Server Error', errorDetails: error.toString() });
  }
}
