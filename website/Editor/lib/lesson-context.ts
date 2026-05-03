export interface LessonStep {
  id: string
  number: number
  title: string
  description: string
  completed: boolean
  estimatedTime: string
  objective: string
  filePath: string
  lineStart: number
  lineEnd: number
  highlightedSymbol: string
  successCondition: string
  hint: string
  explanation: string
  quiz: {
    question: string
    options: string[]
    answer: string
  }
}

export interface LessonFile {
  name: string
  path: string
}

export interface Lesson {
  id: string
  title: string
  currentStepIndex: number
  completionPercentage: number
  learningObjectives: string[]
  codeFiles: LessonFile[]
  steps: LessonStep[]
}

export const mockLesson: Lesson = {
  id: 'repo-auth-flow',
  title: 'Understanding the Authentication Flow',
  currentStepIndex: 0,
  completionPercentage: 0,
  learningObjectives: [
    'Trace where the axios client is created',
    'Understand how credentials reach the API',
    'See how the session is stored locally',
    'Review the tradeoffs in the current token handling',
  ],
  codeFiles: [
    { name: 'src/lib/api.ts', path: 'src/lib/api.ts' },
    { name: 'src/services/authService.ts', path: 'src/services/authService.ts' },
    { name: 'src/features/auth/LoginForm.tsx', path: 'src/features/auth/LoginForm.tsx' },
  ],
  steps: [
    {
      id: 'step-1',
      number: 1,
      title: 'Start at the shared API client',
      description: 'Identify the reusable axios instance and its configured base URL.',
      completed: false,
      estimatedTime: '2 min',
      objective: 'Trace where the axios client is created',
      filePath: 'src/lib/api.ts',
      lineStart: 1,
      lineEnd: 10,
      highlightedSymbol: 'axios.create',
      successCondition: 'Select the symbol that initializes the shared API client.',
      hint: 'Look for the function that builds a reusable request instance.',
      explanation:
        'This step introduces the shared HTTP client. By centralizing configuration in one place, the rest of the app can make requests without repeating the base URL or default options each time.',
      quiz: {
        question: 'Why create a shared API client?',
        options: ['To avoid repeated request setup', 'To replace React state', 'To remove async code'],
        answer: 'To avoid repeated request setup',
      },
    },
    {
      id: 'step-2',
      number: 2,
      title: 'Follow the login request',
      description: 'See how the email and password are sent to the backend.',
      completed: false,
      estimatedTime: '3 min',
      objective: 'Understand how credentials reach the API',
      filePath: 'src/services/authService.ts',
      lineStart: 1,
      lineEnd: 14,
      highlightedSymbol: 'API.post',
      successCondition: 'Find the call that sends credentials to the login endpoint.',
      hint: 'Look for the request method used with the `/api/auth/login` path.',
      explanation:
        'The login function takes raw user credentials and forwards them through the configured API client. This keeps the request logic isolated from the UI layer and makes the authentication flow easier to test.',
      quiz: {
        question: 'Which layer should usually own API calls?',
        options: ['A service layer', 'The CSS file', 'The browser history API'],
        answer: 'A service layer',
      },
    },
    {
      id: 'step-3',
      number: 3,
      title: 'Check how session data is stored',
      description: 'Review where the returned user data and token are persisted.',
      completed: false,
      estimatedTime: '2 min',
      objective: 'See how the session is stored locally',
      filePath: 'src/services/authService.ts',
      lineStart: 15,
      lineEnd: 28,
      highlightedSymbol: 'localStorage',
      successCondition: 'Spot the browser API used to persist the session.',
      hint: 'It is a built-in web storage mechanism.',
      explanation:
        'Persisting the token and user object enables sessions to survive page refreshes. The tradeoff is that browser storage is accessible to client-side scripts, so the broader security model matters a lot.',
      quiz: {
        question: 'What does localStorage help with here?',
        options: ['Keeping the session after refresh', 'Compiling TypeScript', 'Animating the sidebar'],
        answer: 'Keeping the session after refresh',
      },
    },
    {
      id: 'step-4',
      number: 4,
      title: 'Think about security follow-up work',
      description: 'Connect the happy path to the hardening work the app still needs.',
      completed: false,
      estimatedTime: '3 min',
      objective: 'Review the tradeoffs in the current token handling',
      filePath: 'src/features/auth/LoginForm.tsx',
      lineStart: 1,
      lineEnd: 20,
      highlightedSymbol: 'token',
      successCondition: 'Identify the sensitive value that should be handled carefully.',
      hint: 'Focus on the data returned after a successful login.',
      explanation:
        'This final step shifts from mechanics to design judgment. The current approach works for a prototype, but production apps often add token refresh, expiry handling, and safer storage patterns depending on the threat model.',
      quiz: {
        question: 'What is a likely next improvement?',
        options: ['Token refresh handling', 'Inlining all styles', 'Removing error handling'],
        answer: 'Token refresh handling',
      },
    },
  ],
}
