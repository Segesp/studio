
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Task } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;

  if (req.method === 'GET') {
    try {
      const { status, limit: limitQuery } = req.query;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : undefined;

      const tasks = await prisma.task.findMany({
        where: {
          userId,
          ...(status && { status: status as string }),
        },
        orderBy: {
          dueDate: 'asc',
        },
        take: limit,
      });
      res.status(200).json(tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, dueDate, priority, tags, status } = req.body as Partial<Task>;
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const newTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority !== undefined ? Number(priority) : 0,
          tags: tags || [],
          status: status || 'pending',
          userId,
        },
      });
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Failed to create task:', error);
      res.status(500).json({ message: 'Failed to create task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
