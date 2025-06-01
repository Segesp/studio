# Synergy Suite - A Firebase Studio Project

This is a Next.js starter project for **Synergy Suite**, an all-in-one platform for collaborative document editing, task management, and smart scheduling.

## Getting Started

Follow these steps to get your development environment set up:

1.  **Install Dependencies**:
    Open your terminal and run:
    ```bash
    npm install
    ```

2.  **Set Up Environment Variables**:
    Copy the example environment file to a new `.env` file:
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in the necessary environment variables (API keys, database URLs, etc.).

3.  **Run the Development Server**:
    To start the Next.js development server (with Turbopack on port 9002 by default):
    ```bash
    npm run dev
    ```
    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

4.  **Run Genkit Development Server (for AI features)**:
    If you are working on AI features using Genkit, you'll need to run its development server in a separate terminal:
    ```bash
    npm run genkit:dev
    ```
    Or, to watch for changes:
    ```bash
    npm run genkit:watch
    ```

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts a Next.js production server (after building).
*   `npm run lint`: Runs ESLint to check for code quality and style issues.
*   `npm run typecheck`: Runs TypeScript compiler to check for type errors.
*   `npm run test`: (Currently a placeholder) Placeholder for running automated tests.
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.

## Project Structure

*   `src/app`: Contains the main application routes and pages (using Next.js App Router).
    *   `src/app/(app)`: Authenticated application routes and layout.
*   `src/components`: Shared UI components.
    *   `src/components/ui`: ShadCN UI components.
    *   `src/components/layout`: Layout-specific components like navigation.
    *   `src/components/smart-assist`: Forms and components for AI features.
*   `src/ai`: Genkit flows and AI-related logic.
    *   `src/ai/flows`: Specific AI flows for features like task prioritization.
*   `src/lib`: Utility functions.
*   `src/hooks`: Custom React hooks.
*   `public`: Static assets.

To get started with development, take a look at `src/app/page.tsx` (which redirects to `/dashboard`) and the feature pages within `src/app/(app)/`.
