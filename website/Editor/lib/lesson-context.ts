export interface LessonStep {
  id: string
  number: number
  title: string
  completed: boolean
  estimatedTime: string
  objective: string
  markdown: string
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
      completed: false,
      estimatedTime: '2 min',
      objective: 'Trace where the axios client is created',
      markdown: '',
    },
    {
      id: 'step-2',
      number: 2,
      title: 'Follow the login request',
      completed: false,
      estimatedTime: '3 min',
      objective: 'Understand how credentials reach the API',
      markdown: '',
    },
    {
      id: 'step-3',
      number: 3,
      title: 'Check how session data is stored',
      completed: false,
      estimatedTime: '2 min',
      objective: 'See how the session is stored locally',
      markdown: '',
    },
    {
      id: 'step-4',
      number: 4,
      title: 'Think about security follow-up work',
      completed: false,
      estimatedTime: '3 min',
      objective: 'Review the tradeoffs in the current token handling',
      markdown: '',
    },
  ],
}
