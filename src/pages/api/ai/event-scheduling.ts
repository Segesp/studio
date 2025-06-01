import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

// Definición de interfaces fuera de la función handler
interface EventSchedulingRequest {
  userConstraints: {
    availableSlots?: Array<{ date: string; startHour: number; endHour: number }>;
    duration: number;
    attendees?: number;
    priority?: number;
  };
  eventPreferences: {
    title: string;
    description?: string;
    dateRange: { start: string; end: string };
    locationPreference?: string;
  };
}

interface EventSchedulingResponse {
  suggestions: Array<{
    date: string;
    startTime: string;
    endTime: string;
    score: number;
    note?: string;
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
      const payload = req.body as EventSchedulingRequest;

      if (!payload || !payload.userConstraints || !payload.eventPreferences || payload.userConstraints.duration === undefined || !payload.eventPreferences.dateRange) {
        return res.status(400).json({ message: 'Missing required payload fields (userConstraints, eventPreferences, duration, dateRange)' });
      }

      const { userConstraints, eventPreferences } = payload;
      const startDate = new Date(eventPreferences.dateRange.start);
      const endDate = new Date(eventPreferences.dateRange.end);
      const durationMs = userConstraints.duration * 60 * 60 * 1000; // duration in milliseconds

      // Basic placeholder logic to generate simulated suggestions
      const simulatedSuggestions = [];
      // Simulate a suggestion for the start date
      const firstSuggestionDate = new Date(startDate);
      const firstStartTime = '09:00';
      const firstEndTime = new Date(new Date(`${firstSuggestionDate.toISOString().split('T')[0]}T${firstStartTime}:00`).getTime() + durationMs).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      simulatedSuggestions.push({
        date: firstSuggestionDate.toISOString().split('T')[0],
        startTime: firstStartTime,
        endTime: firstEndTime,
        score: 0.9, // High score for simplicity
        note: 'Suggested slot based on general availability.',
      });

      return res.status(200).json({ suggestions: simulatedSuggestions } as EventSchedulingResponse);
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