'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Step {
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
  quiz: any
}

interface Lesson {
  id: string
  title: string
}

interface CenterContentProps {
  lesson: Lesson
  currentStep: Step
  currentStepIndex: number
  totalSteps: number
  showSuccess: boolean
  highlightedSymbol: string | null
  onSymbolClick: (symbol: string) => void
  onNextStep: () => void
  onPrevStep: () => void
}

export function CenterContent({
  lesson,
  currentStep,
  currentStepIndex,
  totalSteps,
  showSuccess,
  highlightedSymbol,
  onSymbolClick,
  onNextStep,
  onPrevStep
}: CenterContentProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{currentStep.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onPrevStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={onNextStep}
              disabled={currentStepIndex === totalSteps - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Blog Style */}
      <div className="flex-1 overflow-y-auto px-15 py-6 space-y-12">
        <div className="w-full  max-w-6xl mx-auto">
          {/* Introduction Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 mb-12"
          >
            <p className="text-base leading-relaxed text-foreground">
              {currentStep.explanation}
            </p>
          </motion.div>

          {/* Code Snippet 1 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-12"
          >
            <Card className="bg-slate-900 border-border overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <p className="text-xs font-mono text-slate-400">
                  {currentStep.filePath}
                </p>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-slate-200">
                  {codeContent}
                </code>
              </pre>
            </Card>
          </motion.div>

          {/* Additional Context Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-4 mb-12"
          >
            <h3 className="text-lg font-semibold text-foreground">Understanding the Details</h3>
            <p className="text-base leading-relaxed text-foreground">
              The API configuration creates an axios instance with a base URL from environment variables. This allows the login function to make authenticated requests to the backend without repeating the base URL in every call. The credentials are sent in the request body and the response includes user data and authentication tokens necessary for subsequent requests.
            </p>
          </motion.div>

          {/* Code Snippet 2 - Service Layer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mb-12"
          >
            <Card className="bg-slate-900 border-border overflow-hidden">
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                <p className="text-xs font-mono text-slate-400">
                  src/services/authService.ts
                </p>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm font-mono text-slate-200">
{`export const handleLogin = async (credentials) => {
  try {
    const response = await login(
      credentials.email,
      credentials.password
    );
    
    // Store the user session
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};`}
                </code>
              </pre>
            </Card>
          </motion.div>

          {/* Final Context */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground">Error Handling & Security</h3>
            <p className="text-base leading-relaxed text-foreground">
              The service layer wraps the API call in a try-catch block to handle potential errors gracefully. Tokens and user information are stored in localStorage for persistence across sessions. In production, consider using more secure storage mechanisms and implementing token refresh logic to maintain session validity.
            </p>
          </motion.div>
        </div>


      </div>
    </div>
  )
}

// Mock code content for display
const codeContent = `import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export const login = async (email: string, password: string) => {
  const response = await API.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};`
