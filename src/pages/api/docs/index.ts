
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Doc } from '@prisma/client';

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
      const { limit: limitQuery, order } = req.query; // order example: 'updatedAt desc'
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : undefined;
      
      let orderBy: any = { updatedAt: 'desc' }; // Default ordering
      if (order === 'updatedAt desc') {
        orderBy = { updatedAt: 'desc' };
      } else if (order === 'createdAt asc') {
        orderBy = { createdAt: 'asc' };
      }
      // Add more order options if needed

      const docs = await prisma.doc.findMany({
        where: {
          ownerId: userId,
        },
        orderBy,
        take: limit,
        include: {
            owner: {
                select: { name: true, email: true, image: true }
            }
        }
      });
      res.status(200).json(docs);
    } catch (error) {
      console.error('Failed to fetch docs:', error);
      res.status(500).json({ message: 'Failed to fetch docs' });
    }
  } else if (req.method === 'POST') {
    try {
      const { title } = req.body as Partial<Doc>;
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      const newDoc = await prisma.doc.create({
        data: {
          title,
          ownerId: userId,
        },
      });
      // Create an initial empty version
      await prisma.docVersion.create({
        data: {
          docId: newDoc.id,
          content: {}, // Empty JSON object for initial version
          createdBy: userId,
        }
      });
      
      const docWithInitialVersion = await prisma.doc.findUnique({
        where: {id: newDoc.id},
        include: { versions: true}
      })

      res.status(201).json(docWithInitialVersion);
    } catch (error) {
      console.error('Failed to create doc:', error);
      res.status(500).json({ message: 'Failed to create doc' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
