'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockLesson } from '@/lib/lesson-context'
import { CenterContent } from './lesson/center-content'
import { RightSidebar } from './lesson/right-sidebar'

export function LessonEditor() {
  const [currentStepIndex, setCurrentStepIndex] = useState(mockLesson.currentStepIndex)
  const [notes, setNotes] = useState('')
  const [completedSteps, setCompletedSteps] = useState(
    mockLesson.steps.map(s => s.completed)
  )
  const [highlightedSymbol, setHighlightedSymbol] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)

  const currentStep = mockLesson.steps[currentStepIndex]
  const completionCount = completedSteps.filter(Boolean).length

  const handleStepClick = (index: number) => {
    if (index < currentStepIndex + 1) {
      setCurrentStepIndex(index)
      setShowSuccess(false)
    }
  }

  const handleNextStep = () => {
    if (currentStepIndex < mockLesson.steps.length - 1) {
      const newCompleted = [...completedSteps]
      newCompleted[currentStepIndex] = true
      setCompletedSteps(newCompleted)
      setCurrentStepIndex(currentStepIndex + 1)
      setShowSuccess(false)
      setHighlightedSymbol(null)
    }
  }

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
      setShowSuccess(false)
      setHighlightedSymbol(null)
    }
  }

  const handleSymbolClick = (symbol: string) => {
    setHighlightedSymbol(symbol)
    if (symbol === currentStep.highlightedSymbol) {
      setShowSuccess(true)
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Center Content */}
      <motion.div
        className="flex-1 flex flex-col overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <CenterContent
          lesson={mockLesson}
          currentStep={currentStep}
          currentStepIndex={currentStepIndex}
          totalSteps={mockLesson.steps.length}
          showSuccess={showSuccess}
          highlightedSymbol={highlightedSymbol}
          onSymbolClick={handleSymbolClick}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
        />
      </motion.div>

      {/* Right Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RightSidebar
          lesson={mockLesson}
          completionCount={completionCount}
          notes={notes}
          onNotesChange={setNotes}
          learningObjectives={mockLesson.learningObjectives}
          completedSteps={completedSteps}
          isOpen={rightSidebarOpen}
          onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        />
      </motion.div>
    </div>
  )
}
