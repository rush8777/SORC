'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Circle, FileCode2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

interface CodeFile {
  name: string
  path: string
}

interface Lesson {
  codeFiles: CodeFile[]
}

interface RightSidebarProps {
  lesson: Lesson
  completionCount: number
  notes: string
  onNotesChange: (notes: string) => void
  learningObjectives: string[]
  completedSteps: boolean[]
  isOpen: boolean
  onToggle: () => void
}

export function RightSidebar({
  lesson,
  completionCount,
  notes,
  onNotesChange,
  learningObjectives,
  completedSteps,
  isOpen,
  onToggle,
}: RightSidebarProps) {
  const completionPercentage = Math.round(
    (completionCount / learningObjectives.length) * 100,
  )

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? 320 : 0 }}
        exit={{ opacity: 0, width: 0 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white border-l border-border flex flex-col h-full"
      >
        <div className="w-full bg-white border-l border-border flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Learning</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-6 py-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Lesson Progress
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-foreground">
                  {completionCount}
                </span>
                <span className="text-sm text-muted-foreground">
                  of {learningObjectives.length} steps completed
                </span>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>

          <div className="px-6 py-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              What you&apos;ll learn
            </p>
            <div className="space-y-3">
              {learningObjectives.map((objective, index) => (
                <motion.div
                  key={objective}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3"
                >
                  {completedSteps[index] ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-sm text-foreground">{objective}</span>
                </motion.div>
              ))}
            </div>
          </div>

          
          <div className="px-6 py-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Files in this lesson
            </p>
          </div>
          <div className="px-6 pb-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {lesson.codeFiles.map((file) => (
                <motion.button
                  key={file.path}
                  whileHover={{ x: 4 }}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-600 flex-shrink-0 group-hover:text-blue-700" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.path}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
