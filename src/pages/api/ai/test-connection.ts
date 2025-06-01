import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

interface TestConnectionResponse {
  success: boolean;
  message: string;
  hasGoogleApiKey: boolean;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestConnectionResponse>
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized',
        hasGoogleApiKey: false,
        timestamp: new Date().toISOString()
      });
    }

    if (req.method === 'GET') {
      const hasGoogleApiKey = !!process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY !== 'your-google-api-key-here';
      
      if (!hasGoogleApiKey) {
        return res.status(200).json({
          success: false,
          message: 'Google API key is not configured. Please set GOOGLE_API_KEY in your environment variables.',
          hasGoogleApiKey: false,
          timestamp: new Date().toISOString()
        });
      }

      // Test the Google AI connection by trying to import the AI module
      try {
        const { ai } = await import('@/ai/genkit');
        return res.status(200).json({
          success: true,
          message: 'Google AI connection is properly configured and ready to use.',
          hasGoogleApiKey: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `AI module initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          hasGoogleApiKey: true,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        message: `Method ${req.method} Not Allowed`,
        hasGoogleApiKey: false,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error(`API Error in ${req.url}:`, error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal Server Error',
      hasGoogleApiKey: false,
      timestamp: new Date().toISOString()
    });
  }
}
