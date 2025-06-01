
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { DocVersion } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const userId = session.user.id;
  const docId = req.query.id as string;

  if (!docId) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  // Verify the user owns the parent document or has access
  const parentDoc = await prisma.doc.findUnique({ where: { id: docId } });
  if (!parentDoc) {
    return res.status(404).json({ message: 'Parent document not found' });
  }
  if (parentDoc.ownerId !== userId) {
    // Add logic for shared documents if needed, for now, only owner can manage versions
    return res.status(403).json({ message: 'Forbidden to access versions for this document' });
  }

  if (req.method === 'GET') {
    try {
      const versions = await prisma.docVersion.findMany({
        where: {
          docId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        // Optionally include who created it if `createdBy` stores user ID and you want to show names
        // include: { createdByUser: { select: { name: true } } } // if createdBy refers to User model
      });
      res.status(200).json(versions);
    } catch (error) {
      console.error('Failed to fetch document versions:', error);
      res.status(500).json({ message: 'Failed to fetch document versions' });
    }
  } else if (req.method === 'POST') {
    try {
      const { content } = req.body as Partial<Pick<DocVersion, 'content'>>;
      if (content === undefined) { // content can be an empty object {} for CRDTs
        return res.status(400).json({ message: 'Content is required for a version' });
      }

      const newVersion = await prisma.docVersion.create({
        data: {
          docId,
          content, // Prisma will handle JSON type
          createdBy: userId, // Store the ID of the user creating the version
        },
      });
      
      // Also update the parent document's updatedAt timestamp
      await prisma.doc.update({
        where: { id: docId },
        data: { updatedAt: new Date() }
      });

      res.status(201).json(newVersion);
    } catch (error) {
      console.error('Failed to create document version:', error);
      res.status(500).json({ message: 'Failed to create document version' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
