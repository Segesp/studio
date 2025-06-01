
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Event } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    try {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      // For events, we might allow reading public events from other users later.
      // For now, strict to user's own events.
      if (event.userId !== userId && !event.isPublic) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  } else if (req.method === 'PUT') {
    try {
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
    } catch (error) {
      console.error('Failed to update event:', error);
      res.status(500).json({ message: 'Failed to update event' });
    }
  } else if (req.method === 'DELETE') {
    try {
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
    } catch (error) {
      console.error('Failed to delete event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
