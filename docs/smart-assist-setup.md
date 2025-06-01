# Smart Assist AI Features - Setup Guide

## Overview

Synergy Suite's Smart Assist features leverage Google's Gemini AI to provide intelligent suggestions for:

1. **Smart Event Scheduling** - Find optimal meeting times considering participant availability
2. **Smart Task Prioritization** - Intelligently prioritize tasks based on deadlines, importance, and context
3. **Intelligent Deadline Reminders** - Get smart suggestions on when to be reminded about upcoming deadlines

## Configuration

### Step 1: Obtain Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Google AI Configuration for Smart-Assist Features
GOOGLE_API_KEY="your-actual-api-key-here"
```

### Step 3: Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features

### Smart Event Scheduling

**Purpose**: Find the optimal time for events considering multiple participants, timezones, and preferences.

**Input**:
- List of participants (email addresses)
- Event duration in minutes
- Location (physical or virtual)
- Additional context

**Output**:
- Suggested optimal time slot
- Reasoning behind the suggestion

**Example Use Case**: Planning a quarterly review meeting with team members across different time zones.

### Smart Task Prioritization

**Purpose**: Intelligently prioritize tasks based on multiple factors including deadlines, importance, and contextual information.

**Input**:
- List of tasks with descriptions, deadlines, and importance levels
- User preferences for task management
- Additional context for each task

**Output**:
- Prioritized list of tasks with scores
- Reasoning for each priority assignment

**Example Use Case**: Managing multiple project deadlines and deciding which tasks to tackle first.

### Intelligent Deadline Reminders

**Purpose**: Determine the optimal time to remind users about upcoming deadlines based on task complexity and current workload.

**Input**:
- Task name and deadline
- Task complexity level (low, medium, high)
- Current workload (light, moderate, heavy)
- User preferences for reminders

**Output**:
- Whether a reminder should be sent
- Optimal reminder time if applicable
- Reasoning behind the decision

**Example Use Case**: Getting timely reminders for complex tasks that require significant preparation time.

## Fallback Behavior

If the Google API key is not configured, the system provides intelligent fallback responses:

- **Event Scheduling**: Basic time suggestions with explanations
- **Task Prioritization**: Rule-based prioritization using deadlines and importance levels
- **Deadline Reminders**: Logic-based reminder scheduling considering complexity and workload

This ensures that the features remain functional even without AI configuration, while providing enhanced intelligence when properly configured.

## Testing

Use the built-in connection test and demo showcase on the Smart Assist page to:

1. Verify your API configuration
2. See example inputs and outputs
3. Test the features with sample data

## Troubleshooting

### Common Issues

1. **"AI features are unavailable"**: Check that your `GOOGLE_API_KEY` is set correctly in `.env.local`
2. **API quota exceeded**: Monitor your usage in Google AI Studio
3. **Connection timeouts**: Verify your internet connection and API key validity

### Getting Help

- Check the connection status on the Smart Assist page
- Review the demo examples to understand expected input formats
- Verify your API key is active in Google AI Studio

## Security Notes

- Never commit your actual API key to version control
- Use environment variables for all sensitive configuration
- Monitor your API usage to avoid unexpected charges
- Consider implementing rate limiting for production deployments

## Next Steps

Once configured, you can:

1. Integrate AI suggestions into your workflow
2. Customize the prompts for your specific use cases
3. Extend the features with additional AI capabilities
4. Set up automated reminders based on AI suggestions

For more information about Google AI APIs, visit the [official documentation](https://ai.google.dev/docs).
