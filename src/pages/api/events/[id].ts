
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Event } from '@prisma/client';

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
    const eventId = req.query.id as string;

    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }

    if (req.method === 'GET') {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      if (event.userId !== userId && !event.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.status(200).json(event);
    } else if (req.method === 'PUT') {
      const eventToUpdate = await prisma.event.findUnique({ where: { id: eventId } });
      if (!eventToUpdate) {
        return res.status(404).json({ message: 'Event not found' });
      }
      if (eventToUpdate.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title, description, startDate, endDate, color, isPublic } = req.body as Partial<Event>;
      const updatedEvent = await prisma.event.update({
        where: { id: eventId },
        data: {
          title,
          description,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          color,
          isPublic,
        },
      });
      res.status(200).json(updatedEvent);
    } else if (req.method === 'DELETE') {
      const eventToDelete = await prisma.event.findUnique({ where: { id: eventId } });
      if (!eventToDelete) {
        return res.status(404).json({ message: 'Event not found' });
      }
      if (eventToDelete.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      await prisma.event.delete({
        where: { id: eventId },
      });
      res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Internal Server Error', errorDetails: error.toString() });
  }
}
