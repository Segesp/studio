import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: any[] = [];

// Conditionally add the Google AI plugin
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
} else {
  // Optional: Log a warning if in development and the key is missing
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'GOOGLE_API_KEY is not set in environment variables. ' +
      'Google AI plugin for Genkit will not be available, and AI flows relying on it may fail.'
    );
  }
}

export const ai = genkit({
  plugins: plugins,
  // Removed default model from here: model: 'googleai/gemini-2.0-flash',
  // Models should be specified in each prompt or generation call.
});
