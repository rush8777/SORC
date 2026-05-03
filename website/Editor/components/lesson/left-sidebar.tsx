'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'

interface Step {
  id: string
  number: number
  title: string
  description: string
  completed: boolean
  estimatedTime: string
}

interface Lesson {
  repo: string
  branch: string
  completionPercentage: number
  steps: Step[]
}

interface LeftSidebarProps {
  lesson: Lesson
  currentStepIndex: number
  completedSteps: boolean[]
  onStepClick: (index: number) => void
  completionCount: number
}

export function LeftSidebar({
  lesson,
  currentStepIndex,
  completedSteps,
  onStepClick,
  completionCount
}: LeftSidebarProps) {
  const completionPercentage = Math.round((completionCount / lesson.steps.length) * 100)

  return (
    <div className="w-72 bg-white border-r border-border flex flex-col overflow-hidden">
      {/* Header with back button */}
      <div className="p-5 border-b border-border">
        <button className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 flex items-center gap-1">
          ← All Lessons
        </button>
        <h2 className="text-sm font-semibold text-foreground">E-Commerce App</h2>
        <p className="text-xs text-muted-foreground mt-1">{completionPercentage}% complete</p>
      </div>

      {/* Course Progress Card */}
      <div className="px-5 pt-5">
        <Card className="p-4 bg-slate-50 border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-foreground">Lesson 3 of 12</span>
            <span className="text-xs text-muted-foreground">{lesson.branch}</span>
          </div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Follow the Login Flow</h3>
          <Progress
            value={completionPercentage}
            className="h-1.5 mt-3"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {completionCount} of {lesson.steps.length} steps completed
          </p>
        </Card>
      </div>

      {/* Steps Navigation */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          Steps
        </p>
        <nav className="space-y-2">
          {lesson.steps.map((step, index) => {
            const isCompleted = completedSteps[index]
            const isActive = index === currentStepIndex
            const isUnlocked = index <= currentStepIndex || isCompleted

            return (
              <motion.button
                key={step.id}
                onClick={() => isUnlocked && onStepClick(index)}
                disabled={!isUnlocked}
                whileHover={isUnlocked ? { x: 4 } : {}}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : isCompleted
                      ? 'bg-green-50 hover:bg-green-100 text-foreground'
                      : 'bg-slate-50 text-foreground hover:bg-slate-100'
                } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : isActive ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Circle className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{step.title}</p>
                    <p className={`text-xs mt-1 ${
                      isActive ? 'text-white/80' : 'text-muted-foreground'
                    }`}>
                      {step.estimatedTime}
                    </p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </nav>
      </div>

      {/* Help Card */}
      <div className="p-5 border-t border-border bg-slate-50">
        <Card className="p-4 border-border">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">Need help?</p>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 mt-2 text-xs hover:bg-white"
              >
                Ask AI Tutor
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
