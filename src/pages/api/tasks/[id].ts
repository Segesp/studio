
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
  const taskId = req.query.id as string;

  if (!taskId) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (task.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.status(200).json(task);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      res.status(500).json({ message: 'Failed to fetch task' });
    }
  } else if (req.method === 'PUT') {
    try {
      const taskToUpdate = await prisma.task.findUnique({ where: { id: taskId } });
      if (!taskToUpdate) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (taskToUpdate.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title, description, dueDate, priority, tags, status } = req.body as Partial<Task>;
      const updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          priority: priority !== undefined ? Number(priority) : undefined,
          tags,
          status,
        },
      });
      res.status(200).json(updatedTask);
    } catch (error) {
      console.error('Failed to update task:', error);
      res.status(500).json({ message: 'Failed to update task' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const taskToDelete = await prisma.task.findUnique({ where: { id: taskId } });
      if (!taskToDelete) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (taskToDelete.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.task.delete({
        where: { id: taskId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Failed to delete task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
