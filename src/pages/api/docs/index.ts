
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Doc } from '@prisma/client';

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
      const { limit: limitQuery, order } = req.query;
      const limit = limitQuery ? parseInt(limitQuery as string, 10) : undefined;
      
      let orderBy: any = { updatedAt: 'desc' };
      if (order === 'updatedAt desc') {
        orderBy = { updatedAt: 'desc' };
      } else if (order === 'createdAt asc') {
        orderBy = { createdAt: 'asc' };
      }

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
    } else if (req.method === 'POST') {
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
      
      await prisma.docVersion.create({
        data: {
          docId: newDoc.id,
          content: {}, 
          createdBy: userId,
        }
      });
      
      const docWithInitialVersion = await prisma.doc.findUnique({
        where: {id: newDoc.id},
        include: { versions: true}
      });

      res.status(201).json(docWithInitialVersion);
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
