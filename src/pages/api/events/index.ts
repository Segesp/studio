
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

  if (req.method === 'GET') {
    try {
      const { upcoming, limit: limitQuery } = req.query;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : undefined;
      
      let whereClause: any = { userId };
      if (upcoming === 'true') {
        whereClause.startDate = { gte: new Date() };
      }

      const events = await prisma.event.findMany({
        where: whereClause,
        orderBy: {
          startDate: 'asc',
        },
        take: limit,
      });
      res.status(200).json(events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description, startDate, endDate, color, isPublic } = req.body as Partial<Event>;
      if (!title || !startDate || !endDate) {
        return res.status(400).json({ message: 'Title, startDate, and endDate are required' });
      }

      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          color: color || 'blue',
          isPublic: isPublic || false,
          userId,
        },
      });
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Failed to create event:', error);
      res.status(500).json({ message: 'Failed to create event' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
