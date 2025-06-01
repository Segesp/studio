import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface TaskPrioritizationRequest {
  tasks: Array<{
    id: string;
    title: string;
    dueDate?: string;
    estimatedEffort?: number; // In hours
    importance?: number; // e.g., 1-5
    dependencies?: string[]; // Array of task IDs
    priority?: number; // e.g. from 0 to 3 or similar
  }>;
  constraints?: {
    dailyWorkingHours?: number;
    workingDays?: string[]; // e.g., ['Monday', 'Tuesday']
  };
}

interface TaskPrioritizationResponse {
  prioritizedTasks: Array<{
    id: string;
    recommendedStart: string;
    recommendedEnd: string;
    rank: number; // Lower number means higher priority
    suggestion: string;
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
      const payload = req.body as TaskPrioritizationRequest;

      if (!payload || !payload.tasks || !Array.isArray(payload.tasks)) {
        return res.status(400).json({ message: 'Invalid request body: tasks array is required.' });
      }

      // Basic placeholder logic for prioritization
      const simulatedPrioritizedTasks: TaskPrioritizationResponse['prioritizedTasks'] = payload.tasks
        .map(task => {
          // Simulate rank based on provided priority or importance, or default
          const rank = task.priority !== undefined ? task.priority : (task.importance !== undefined ? (5 - task.importance) : 10); // Lower number is higher rank

          // Simulate recommended start/end times
          const startDate = task.dueDate ? new Date(task.dueDate) : new Date();
          // For simplicity, simulate duration as 1 hour from start date
          const endDate = new Date(startDate.getTime() + (task.estimatedEffort || 1) * 60 * 60 * 1000);

          return {
            id: task.id,
            recommendedStart: startDate.toISOString(),
            recommendedEnd: endDate.toISOString(),
            rank: rank,
            suggestion: `Prioritized based on available data. Consider starting around ${startDate.toLocaleTimeString()}.`,
          };
        })
        .sort((a, b) => a.rank - b.rank); // Sort by rank (lower is higher priority)

      const response: TaskPrioritizationResponse = {
        prioritizedTasks: simulatedPrioritizedTasks,
      };
      return res.status(200).json(response);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    res.status(500).json({ message: 'Internal Server Error', errorDetails: error.toString() });
  }
}