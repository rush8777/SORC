'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { PanelLeft } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/hooks/use-toast'
import { CenterContent } from './lesson/center-content'
import { RightSidebar } from './lesson/right-sidebar'
import { fetchLesson } from '@shared/integration/api'
import type { LessonContent } from '@shared/integration/types'

export function LessonEditor() {
  const [lesson, setLesson] = useState<LessonContent | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [notes, setNotes] = useState('')
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLesson = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const projectId = params.get('projectId')
        const lessonId = params.get('lessonId')

        if (!projectId || !lessonId) {
          throw new Error('Missing project or lesson selection in the URL.')
        }

        const payload = await fetchLesson(projectId, lessonId)
        if (cancelled) {
          return
        }

        setLesson(payload.lesson.lesson)
        setCurrentStepIndex(payload.lesson.lesson.currentStepIndex)
        setCompletedSteps(payload.lesson.lesson.steps.map((step) => step.completed))
      } catch (nextError) {
        if (cancelled) {
          return
        }

        const message = nextError instanceof Error ? nextError.message : 'Failed to load lesson.'
        setError(message)
        toast({
          title: 'Lesson load failed',
          description: message,
          variant: 'destructive',
        })
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLesson()

    return () => {
      cancelled = true
    }
  }, [])

  const currentStep = useMemo(() => {
    if (!lesson) {
      return null
    }

    return lesson.steps[currentStepIndex] ?? lesson.steps[0] ?? null
  }, [currentStepIndex, lesson])

  const completionCount = completedSteps.filter(Boolean).length

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex + 1) {
      setCurrentStepIndex(index)
    }
  }

  const handleNextStep = () => {
    if (lesson && currentStepIndex < lesson.steps.length - 1) {
      const newCompleted = [...completedSteps]
      newCompleted[currentStepIndex] = true
      setCompletedSteps(newCompleted)
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  if (loading) {
    return (
      <>
        <div className="h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
          Loading lesson...
        </div>
        <Toaster />
      </>
    )
  }

  if (error || !lesson || !currentStep) {
    return (
      <>
        <div className="h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
          {error || 'Lesson could not be loaded.'}
        </div>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <div className="h-[125vh] bg-background flex overflow-hidden" style={{ zoom: 0.8 }}>
        <motion.div
          className="flex-1 flex flex-col overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CenterContent
            lesson={lesson}
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={lesson.steps.length}
            onNextStep={handleNextStep}
            onPrevStep={handlePrevStep}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RightSidebar
            lesson={lesson}
            completionCount={completionCount}
            notes={notes}
            onNotesChange={setNotes}
            learningObjectives={lesson.learningObjectives}
            completedSteps={completedSteps}
            isOpen={rightSidebarOpen}
            onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
          />
        </motion.div>

        {!rightSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            onClick={() => setRightSidebarOpen(true)}
            className="fixed right-12 top-32 z-50 flex items-center justify-center w-8 h-8 bg-white border border-border rounded-full shadow-md hover:shadow-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
            aria-label="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </motion.button>
        )}
      </div>
      <Toaster />
    </>
  )
}
