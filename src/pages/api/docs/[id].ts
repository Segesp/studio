
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
  const docId = req.query.id as string;

  if (!docId) {
    return res.status(400).json({ message: 'Document ID is required' });
  }

  if (req.method === 'GET') {
    try {
      const doc = await prisma.doc.findUnique({
        where: { id: docId },
        include: { 
            owner: { select: { name: true, email: true, image: true } },
            versions: { orderBy: { createdAt: 'desc' }, take: 1 } // Include latest version
        }
      });
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }
      if (doc.ownerId !== userId) {
        // Add logic for shared documents later if needed
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.status(200).json(doc);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      res.status(500).json({ message: 'Failed to fetch document' });
    }
  } else if (req.method === 'PATCH') { // For updating doc metadata like title
    try {
      const docToUpdate = await prisma.doc.findUnique({ where: { id: docId } });
      if (!docToUpdate) {
        return res.status(404).json({ message: 'Document not found' });
      }
      if (docToUpdate.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { title } = req.body as Partial<Doc>;
      if (title === undefined) {
        return res.status(400).json({ message: 'No update parameters provided (e.g., title)' });
      }
      
      const updatedDoc = await prisma.doc.update({
        where: { id: docId },
        data: {
          title,
        },
      });
      res.status(200).json(updatedDoc);
    } catch (error) {
      console.error('Failed to update document:', error);
      res.status(500).json({ message: 'Failed to update document' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const docToDelete = await prisma.doc.findUnique({ where: { id: docId } });
      if (!docToDelete) {
        return res.status(404).json({ message: 'Document not found' });
      }
      if (docToDelete.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // Cascade delete versions (Prisma handles this if relations are set up correctly with onDelete: Cascade)
      // Ensure DocVersion model has `doc Doc @relation(fields: [docId], references: [id], onDelete: Cascade)`
      // If not, delete versions manually:
      // await prisma.docVersion.deleteMany({ where: { docId: docId }});
      
      await prisma.doc.delete({
        where: { id: docId },
      });
      res.status(204).end();
    } catch (error) {
      console.error('Failed to delete document:', error);
      // Check for foreign key constraint errors if versions are not cascading
      if ((error as any)?.code === 'P2003') { // Prisma foreign key constraint error
         return res.status(409).json({ message: 'Cannot delete document because it has associated versions. Delete versions first or setup cascade delete.' });
      }
      res.status(500).json({ message: 'Failed to delete document' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
