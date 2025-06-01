import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// Define interfaces for request and response based on Phase 6.1.1
interface DeadlineReminderRequest {
  tasks: Array<{ id: string; title: string; dueDate: string; priority: number; }>;
  userPreferences: { workingHours: { startHour: number; endHour: number }; timezone: string; };
}

interface DeadlineReminderResponse {
  reminders: Array<{
    taskId: string;
    remindAt: string; // ISO 8601 string
    method: 'push' | 'email' | 'in-app';
    message: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (req.method === 'POST') {
      const payload: DeadlineReminderRequest = req.body;

      if (!payload || !payload.tasks || !Array.isArray(payload.tasks)) {
        return res.status(400).json({ message: 'Invalid request body: tasks array is required.' });
      }

      // Basic placeholder logic for generating reminders
      const simulatedReminders = payload.tasks.map(task => {
        // Simulate reminder based on task due date and priority
        const remindAtDate = new Date(task.dueDate);
        // For simplicity, let's just use the due date, potentially slightly adjusted
        const remindAt = remindAtDate.toISOString(); // Use ISO string format
        const method = task.priority > 1 ? 'push' : 'email'; // Example logic: push for high priority
        const message = `Reminder for: ${task.title}`;
        return { taskId: task.id, remindAt, method, message };
      });
      res.status(200).json({ reminders: simulatedReminders } as DeadlineReminderResponse);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ message: error.message || 'Internal Server Error', errorDetails: error.toString() });
  }
}