
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
    const docId = req.query.id as string;

    if (!docId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    if (req.method === 'GET') {
      const doc = await prisma.doc.findUnique({
        where: { id: docId },
        include: { 
            owner: { select: { name: true, email: true, image: true } },
            versions: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });
      if (!doc) {
        return res.status(404).json({ message: 'Document not found' });
      }
      if (doc.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      res.status(200).json(doc);
    } else if (req.method === 'PATCH') {
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
    } else if (req.method === 'DELETE') {
      const docToDelete = await prisma.doc.findUnique({ where: { id: docId } });
      if (!docToDelete) {
        return res.status(404).json({ message: 'Document not found' });
      }
      if (docToDelete.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      // Assuming onDelete: Cascade is set in prisma.schema for Doc -> DocVersion relation.
      // If not, DocVersions must be deleted manually first.
      // await prisma.docVersion.deleteMany({ where: { docId: docId }});
      
      await prisma.doc.delete({
        where: { id: docId },
      });
      res.status(204).end();
    } else {
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    const statusCode = error.statusCode || 500;
    // Check for specific Prisma errors if needed, e.g., foreign key constraint for delete
     if (error.code === 'P2003' && req.method === 'DELETE') {
       return res.status(409).json({ message: 'Cannot delete document because it has associated versions. Ensure cascade delete is configured or delete versions first.' });
    }
    res.status(statusCode).json({ message: error.message || 'Internal Server Error', errorDetails: error.toString() });
  }
}
