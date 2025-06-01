
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { DocVersion } from '@prisma/client';

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
    const docId = req.query.id as string;

    if (!docId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    const parentDoc = await prisma.doc.findUnique({ where: { id: docId } });
    if (!parentDoc) {
      return res.status(404).json({ message: 'Parent document not found' });
    }
    if (parentDoc.ownerId !== userId) {
      return res.status(403).json({ message: 'Forbidden to access versions for this document' });
    }

    if (req.method === 'GET') {
      const versions = await prisma.docVersion.findMany({
        where: {
          docId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      res.status(200).json(versions);
    } else if (req.method === 'POST') {
      const { content } = req.body as Partial<Pick<DocVersion, 'content'>>;
      if (content === undefined) {
        return res.status(400).json({ message: 'Content is required for a version' });
      }

      const newVersion = await prisma.docVersion.create({
        data: {
          docId,
          content,
          createdBy: userId,
        },
      });
      
      await prisma.doc.update({
        where: { id: docId },
        data: { updatedAt: new Date() }
      });

      res.status(201).json(newVersion);
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
