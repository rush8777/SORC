
'use client'

import React, { useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetchPlaygroundSession } from '@shared/integration/api'
import type {
  PlaygroundChallengeStep,
  PlaygroundCodeFile,
  PlaygroundSession,
} from '@shared/integration/types'

type BottomTab = 'ipython' | 'slides'

function getLanguage(className?: string): string {
  if (!className) return 'text'

  const match = className.match(/language-([\w-]+)/)
  return match?.[1] || 'text'
}

function getLanguageLabel(className?: string): string {
  const language = getLanguage(className)
  return language === 'text' ? 'plain text' : language
}

function isShortCodeSnippet(code: string): boolean {
  const trimmed = code.trim()
  if (!trimmed) return true

  const lineCount = trimmed.split(/\r?\n/).length
  return lineCount <= 2 && trimmed.length <= 140
}

export function PlaygroundEditor() {
  const [bottomTab, setBottomTab] = useState<BottomTab>('ipython')
  const [leftOpen, setLeftOpen] = useState(true)
  const [exerciseOpen, setExerciseOpen] = useState(true)
  const [instructionsOpen, setInstructionsOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(480)
  const [isDragging, setIsDragging] = useState(false)
  const [bottomPanelHeight, setBottomPanelHeight] = useState(190)
  const [isDraggingVertical, setIsDraggingVertical] = useState(false)
  const [exerciseHeight, setExerciseHeight] = useState(360)
  const [isDraggingInternal, setIsDraggingInternal] = useState(false)
  const sidebarSplitRef = useRef<HTMLDivElement | null>(null)
  const [session, setSession] = useState<PlaygroundSession | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepCodeFiles, setStepCodeFiles] = useState<Record<string, PlaygroundCodeFile[]>>({})
  const [activeFilePathsByStep, setActiveFilePathsByStep] = useState<Record<string, string>>({})
  const [hintIndices, setHintIndices] = useState<Record<string, number>>({})

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newWidth = e.clientX
    if (newWidth >= 300 && newWidth <= 800) {
      setSidebarWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const handleVerticalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDraggingVertical(true)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const handleVerticalMouseMove = (e: MouseEvent) => {
    if (!isDraggingVertical) return

    const containerHeight = window.innerHeight
    const newHeight = containerHeight - e.clientY
    if (newHeight >= 100 && newHeight <= 400) {
      setBottomPanelHeight(newHeight)
    }
  }

  const handleVerticalMouseUp = () => {
    setIsDraggingVertical(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  const handleInternalMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingInternal(true)
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
  }

  const handleInternalMouseMove = (e: MouseEvent) => {
    if (!isDraggingInternal) return

    const el = sidebarSplitRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const relativeY = e.clientY - rect.top
    const next = Math.round(relativeY)

    if (next >= 120 && next <= rect.height - 120) {
      setExerciseHeight(next)
    }
  }

  const handleInternalMouseUp = () => {
    setIsDraggingInternal(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  React.useEffect(() => {
    if (isDraggingVertical) {
      document.addEventListener('mousemove', handleVerticalMouseMove)
      document.addEventListener('mouseup', handleVerticalMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleVerticalMouseMove)
        document.removeEventListener('mouseup', handleVerticalMouseUp)
      }
    }
  }, [isDraggingVertical])

  React.useEffect(() => {
    if (isDraggingInternal) {
      document.addEventListener('mousemove', handleInternalMouseMove)
      document.addEventListener('mouseup', handleInternalMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleInternalMouseMove)
        document.removeEventListener('mouseup', handleInternalMouseUp)
      }
    }
  }, [isDraggingInternal])

  React.useEffect(() => {
    let cancelled = false

    const loadSession = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('sessionId')
        if (!sessionId) {
          throw new Error('Missing playground session id.')
        }

        const payload = await fetchPlaygroundSession(sessionId)
        if (cancelled) {
          return
        }

        setSession(payload)
        setCompletedSteps(payload.steps.map(() => false))
        setCurrentStepIndex(0)
        setStepCodeFiles(
          payload.steps.reduce<Record<string, PlaygroundCodeFile[]>>((accumulator, step) => {
            if (step.kind === 'challenge') {
              accumulator[step.id] = step.code.files
            }
            return accumulator
          }, {}),
        )
        setActiveFilePathsByStep(
          payload.steps.reduce<Record<string, string>>((accumulator, step) => {
            if (step.kind === 'challenge') {
              accumulator[step.id] = step.code.activeFilePath
            }
            return accumulator
          }, {}),
        )
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Unable to load playground session.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [])

  const currentStep = session?.steps[currentStepIndex] ?? null
  const instructionMarkdown = useMemo(() => {
    if (!currentStep) {
      return ''
    }

    const raw = (currentStep.instructionMarkdown || '').trim()
    if (raw.length > 0) {
      return raw
    }

    return (currentStep.teachingMarkdown || '').trim()
  }, [currentStep])
  const sidebarHeaderMarkdown = "Exercise"
  const completionPercentage = useMemo(() => {
    if (!session || session.steps.length === 0) {
      return 0
    }

    return Math.round((completedSteps.filter(Boolean).length / session.steps.length) * 100)
  }, [completedSteps, session])

  const currentChallengeStep = currentStep?.kind === 'challenge' ? currentStep : null
  const currentLessonStep = currentStep?.kind === 'lesson' ? currentStep : null
  const currentFiles = currentChallengeStep ? stepCodeFiles[currentChallengeStep.id] ?? currentChallengeStep.code.files : []
  const activeFilePath =
    currentChallengeStep ? activeFilePathsByStep[currentChallengeStep.id] ?? currentChallengeStep.code.activeFilePath : ''
  const activeFile = currentFiles.find((file) => file.path === activeFilePath) ?? currentFiles[0] ?? null
  const activeCodeLines = useMemo(() => (activeFile?.content || '').split('\n'), [activeFile])
  const currentHintIndex = currentChallengeStep ? hintIndices[currentChallengeStep.id] ?? 0 : 0
  const currentHint =
    currentChallengeStep?.exercise.hints[Math.min(currentHintIndex, Math.max(currentChallengeStep.exercise.hints.length - 1, 0))]

  const handlePrevStep = () => {
    setCurrentStepIndex((current) => Math.max(0, current - 1))
  }

  const handleNextStep = () => {
    setCompletedSteps((current) => {
      const next = [...current]
      next[currentStepIndex] = true
      return next
    })
    setCurrentStepIndex((current) => Math.min((session?.steps.length || 1) - 1, current + 1))
  }

  const handleTakeHint = () => {
    if (!currentChallengeStep) {
      return
    }

    setHintIndices((current) => ({
      ...current,
      [currentChallengeStep.id]: Math.min((current[currentChallengeStep.id] ?? 0) + 1, currentChallengeStep.exercise.hints.length - 1),
    }))
  }

  const handleCodeChange = (nextContent: string) => {
    if (!currentChallengeStep || !activeFile) {
      return
    }

    setStepCodeFiles((current) => ({
      ...current,
      [currentChallengeStep.id]: (current[currentChallengeStep.id] ?? currentChallengeStep.code.files).map((file) =>
        file.path === activeFile.path ? { ...file, content: nextContent } : file,
      ),
    }))
  }

  const handleActiveFileChange = (nextPath: string) => {
    if (!currentChallengeStep) {
      return
    }

    setActiveFilePathsByStep((current) => ({
      ...current,
      [currentChallengeStep.id]: nextPath,
    }))
  }

  const shellOutput = useMemo(() => {
    if (!currentChallengeStep || !session) {
      return [
        `Layer: ${session?.layerName || 'loading'}`,
        `Language: ${session?.language || 'loading'}`,
        `Progress: ${completionPercentage}%`,
      ]
    }

    return [
      `Layer: ${session.layerName}`,
      `Language: ${session.language}`,
      `Difficulty: ${session.difficulty}`,
      ...currentChallengeStep.shellLines,
      session.sandbox.executeLabel,
      session.sandbox.validationLabel,
    ]
  }, [completionPercentage, currentChallengeStep, session])

  return (
    <div className="h-screen w-full bg-[#0c0f14] text-white overflow-hidden">
      <div className="h-full w-full min-h-0 flex flex-col">
        <header className="px-6 py-2 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-1 flex-1">
              {(session?.steps || new Array(6).fill(null)).map((step, index) => {
                const isComplete = completedSteps[index]
                const isActive = index === currentStepIndex
                return (
                  <button
                    key={step ? step.id : `placeholder-${index}`}
                    type="button"
                    onClick={() => session && setCurrentStepIndex(index)}
                    className={cn(
                      'h-1 w-24 rounded-full transition-colors',
                      isActive ? 'bg-green-400' : isComplete ? 'bg-green-600' : 'bg-gray-300',
                    )}
                    aria-label={`Go to step ${index + 1}`}
                  />
                )
              })}
            </div>
            {currentStep && (
              <div className="ml-4">
                {currentLessonStep ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-3 text-[11px] bg-green-600 hover:bg-green-700"
                    onClick={handleNextStep}
                  >
                    Continue
                  </Button>
                ) : currentChallengeStep ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-3 text-[11px] bg-green-600 hover:bg-green-700"
                    onClick={handleNextStep}
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        </header>

        <div
          className="flex-1 min-h-0 grid"
          style={{ gridTemplateColumns: leftOpen ? `${sidebarWidth}px 4px minmax(0, 1fr)` : '0px minmax(0, 1fr)' }}
        >
          <aside
            className={cn(
              'h-full min-h-0 flex flex-col bg-[#f3f4f6] text-[#0f172a] border-r border-black/10',
              !leftOpen && 'hidden',
            )}
          >
            <div
              ref={sidebarSplitRef}
              className="h-full min-h-0 grid"
              style={{
                gridTemplateRows:
                  exerciseOpen && instructionsOpen ? `${exerciseHeight}px 4px minmax(0, 1fr)` : 'minmax(0, 1fr)',
              }}
            >
              <div className={cn('flex flex-col min-h-0', !exerciseOpen && 'hidden')}>
                <div className="h-9 px-3 flex items-center justify-between bg-[#e5e7eb] border-b border-black/10">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#111827]/60" />
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{sidebarHeaderMarkdown}</ReactMarkdown>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-black/5"
                    aria-label="Toggle Instructions"
                    onClick={() => setInstructionsOpen(!instructionsOpen)}
                  >
                    <ChevronDown className={cn('h-4 w-4 transition-transform', instructionsOpen && 'rotate-180')} />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-auto p-4">
                  {loading ? (
                    <p className="text-xs text-[#334155]">Loading session...</p>
                  ) : error ? (
                    <p className="text-xs text-red-600">{error}</p>
                  ) : currentStep ? (
                    <>
                      <h2 className="text-[15px] font-semibold leading-snug">{currentStep.title}</h2>
                      <p className="mt-2 text-xs leading-relaxed text-[#334155]">{currentStep.objective}</p>

                      <article className="mt-4 prose prose-xs max-w-none prose-headings:text-[#0f172a] prose-p:text-[#334155] prose-li:text-[#334155] prose-strong:text-[#0f172a] prose-code:text-[#0f172a] prose-pre:bg-[#e2e8f0] prose-pre:text-[#0f172a] prose-h1:text-[13px] prose-h2:text-[12px] prose-h3:text-[11px] prose-p:text-[10px] prose-li:text-[10px] prose-ul:text-[10px] prose-ol:text-[10px] prose-blockquote:text-[10px]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children, ...props }) => <h1 className="font-semibold text-[13px] leading-tight mb-2 mt-3 first:mt-0" {...props}>{children}</h1>,
                            h2: ({ children, ...props }) => <h2 className="font-semibold text-[12px] leading-tight mb-2 mt-3 first:mt-0" {...props}>{children}</h2>,
                            h3: ({ children, ...props }) => <h3 className="font-semibold text-[11px] leading-tight mb-2 mt-2 first:mt-0" {...props}>{children}</h3>,
                            h4: ({ children, ...props }) => <h4 className="font-semibold text-[10px] leading-tight mb-1 mt-2 first:mt-0" {...props}>{children}</h4>,
                            p: ({ children, ...props }) => <p className="text-[10px] leading-relaxed mb-2 last:mb-0" {...props}>{children}</p>,
                            ul: ({ children, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props}>{children}</ul>,
                            ol: ({ children, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props}>{children}</ol>,
                            li: ({ children, ...props }) => <li className="text-[10px] leading-relaxed" {...props}>{children}</li>,
                            blockquote: ({ children, ...props }) => (
                              <blockquote className="border-l-2 border-gray-300 pl-3 my-2 italic text-[10px] text-gray-600" {...props}>
                                {children}
                              </blockquote>
                            ),
                            pre: ({ children }: any) => {
                              const codeElement = children?.props
                              const className = codeElement?.className
                              const code = String(codeElement?.children ?? '').replace(/\n$/, '')
                              const isCompact = isShortCodeSnippet(code)

                              return isCompact ? (
                                <div className="my-4 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3 py-2">
                                  <SyntaxHighlighter
                                    language={getLanguage(className)}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      padding: 0,
                                      background: 'transparent',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.45',
                                      overflow: 'visible',
                                    }}
                                    codeTagProps={{
                                      style: {
                                        fontFamily:
                                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                                      },
                                    }}
                                    PreTag="div"
                                  >
                                    {code}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <div className="my-6 overflow-hidden border border-gray-800 bg-gray-950 shadow-lg rounded-lg">
                                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 text-xs text-gray-400">
                                    <span>{getLanguageLabel(className)}</span>
                                    <span>Code</span>
                                  </div>
                                  <SyntaxHighlighter
                                    language={getLanguage(className)}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      padding: '1rem',
                                      background: 'transparent',
                                      fontSize: '0.8rem',
                                      lineHeight: '1.7',
                                    }}
                                    codeTagProps={{
                                      style: {
                                        fontFamily:
                                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                                      },
                                    }}
                                    PreTag="div"
                                  >
                                    {code}
                                  </SyntaxHighlighter>
                                </div>
                              )
                            },
                            code: ({ className, children, ...props }: any) => {
                              const code = String(children).replace(/\n$/, '')
                              const isLanguageBlock = Boolean(className?.includes('language-'))

                              if (isLanguageBlock) {
                                return <code className={className} {...props}>{children}</code>
                              }

                              return (
                                <code
                                  className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] text-blue-900 whitespace-normal break-words align-baseline"
                                  {...props}
                                >
                                  {code}
                                </code>
                              )
                            },
                            hr: ({ ...props }) => <hr className="border-gray-300 my-3" {...props} />,
                            strong: ({ children, ...props }) => <strong className="font-semibold text-[10px]" {...props}>{children}</strong>,
                            em: ({ children, ...props }) => <em className="italic text-[10px]" {...props}>{children}</em>,
                          }}
                        >
                          {currentStep.teachingMarkdown}
                        </ReactMarkdown>
                      </article>
                    </>
                  ) : null}
                </div>
              </div>

              {exerciseOpen && instructionsOpen && (
                <div
                  className="bg-[#d1d5db] hover:bg-[#9ca3af] cursor-row-resize transition-colors"
                  onMouseDown={handleInternalMouseDown}
                  style={{ height: '4px' }}
                />
              )}

              <div className={cn('flex flex-col min-h-0 border-t border-black/10', !instructionsOpen && 'hidden')}>
                <div className="h-9 px-3 flex items-center justify-between bg-[#f8fafc] border-b border-black/10">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full border border-black/20 text-[10px]">i</span>
                    Instructions
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#111827] bg-[#fde047] px-2 py-0.5 rounded">
                      {Math.round(completionPercentage)}%
                    </span>
                    <button
                      type="button"
                      className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-black/5"
                      aria-label="Toggle Exercise"
                      onClick={() => setExerciseOpen(!exerciseOpen)}
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform', exerciseOpen && 'rotate-180')} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-auto px-3 py-3 text-xs text-[#0f172a]">
                  {currentStep ? (
                    <>
                      <article className="prose prose-xs max-w-none prose-headings:text-[#0f172a] prose-p:text-[#334155] prose-li:text-[#334155] prose-strong:text-[#0f172a] prose-code:text-[#0f172a] prose-pre:bg-[#e2e8f0] prose-pre:text-[#0f172a] prose-h1:text-[13px] prose-h2:text-[12px] prose-h3:text-[11px] prose-p:text-[10px] prose-li:text-[10px] prose-ul:text-[10px] prose-ol:text-[10px] prose-blockquote:text-[10px]">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children, ...props }) => <h1 className="font-semibold text-[13px] leading-tight mb-2 mt-3 first:mt-0" {...props}>{children}</h1>,
                            h2: ({ children, ...props }) => <h2 className="font-semibold text-[12px] leading-tight mb-2 mt-3 first:mt-0" {...props}>{children}</h2>,
                            h3: ({ children, ...props }) => <h3 className="font-semibold text-[11px] leading-tight mb-2 mt-2 first:mt-0" {...props}>{children}</h3>,
                            h4: ({ children, ...props }) => <h4 className="font-semibold text-[10px] leading-tight mb-1 mt-2 first:mt-0" {...props}>{children}</h4>,
                            p: ({ children, ...props }) => <p className="text-[10px] leading-relaxed mb-2 last:mb-0" {...props}>{children}</p>,
                            ul: ({ children, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props}>{children}</ul>,
                            ol: ({ children, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props}>{children}</ol>,
                            li: ({ children, ...props }) => <li className="text-[10px] leading-relaxed" {...props}>{children}</li>,
                            blockquote: ({ children, ...props }) => (
                              <blockquote className="border-l-2 border-gray-300 pl-3 my-2 italic text-[10px] text-gray-600" {...props}>
                                {children}
                              </blockquote>
                            ),
                            pre: ({ children }: any) => {
                              const codeElement = children?.props
                              const className = codeElement?.className
                              const code = String(codeElement?.children ?? '').replace(/\n$/, '')
                              const isCompact = isShortCodeSnippet(code)

                              return isCompact ? (
                                <div className="my-4 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3 py-2">
                                  <SyntaxHighlighter
                                    language={getLanguage(className)}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      padding: 0,
                                      background: 'transparent',
                                      fontSize: '0.75rem',
                                      lineHeight: '1.45',
                                      overflow: 'visible',
                                    }}
                                    codeTagProps={{
                                      style: {
                                        fontFamily:
                                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                                      },
                                    }}
                                    PreTag="div"
                                  >
                                    {code}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <div className="my-6 overflow-hidden border border-gray-800 bg-gray-950 shadow-lg rounded-lg">
                                  <div className="flex items-center justify-between border-b border-gray-800 px-4 py-2 text-xs text-gray-400">
                                    <span>{getLanguageLabel(className)}</span>
                                    <span>Code</span>
                                  </div>
                                  <SyntaxHighlighter
                                    language={getLanguage(className)}
                                    style={vscDarkPlus}
                                    customStyle={{
                                      margin: 0,
                                      padding: '1rem',
                                      background: 'transparent',
                                      fontSize: '0.8rem',
                                      lineHeight: '1.7',
                                    }}
                                    codeTagProps={{
                                      style: {
                                        fontFamily:
                                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
                                      },
                                    }}
                                    PreTag="div"
                                  >
                                    {code}
                                  </SyntaxHighlighter>
                                </div>
                              )
                            },
                            code: ({ className, children, ...props }: any) => {
                              const code = String(children).replace(/\n$/, '')
                              const isLanguageBlock = Boolean(className?.includes('language-'))

                              if (isLanguageBlock) {
                                return <code className={className} {...props}>{children}</code>
                              }

                              return (
                                <code
                                  className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] text-blue-900 whitespace-normal break-words align-baseline"
                                  {...props}
                                >
                                  {code}
                                </code>
                              )
                            },
                            hr: ({ ...props }) => <hr className="border-gray-300 my-3" {...props} />,
                            strong: ({ children, ...props }) => <strong className="font-semibold text-[10px]" {...props}>{children}</strong>,
                            em: ({ children, ...props }) => <em className="italic text-[10px]" {...props}>{children}</em>,
                          }}
                        >
                          {instructionMarkdown}
                        </ReactMarkdown>
                      </article>

                                          </>
                  ) : null}
                </div>
              </div>
            </div>
          </aside>

          {leftOpen && (
            <div
              className="bg-[#1f2937] hover:bg-[#374151] cursor-col-resize transition-colors"
              onMouseDown={handleMouseDown}
              style={{ width: '4px' }}
            />
          )}

          <section className="h-full min-h-0 flex flex-col min-w-0">
            <header className="h-10 bg-[#111827] border-b border-white/10 flex items-center justify-between px-3 gap-3">
              <div className="text-xs font-semibold truncate">
                {currentChallengeStep ? activeFile?.path || 'challenge.ts' : currentLessonStep?.visual.title || 'Lesson'}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] text-white hover:bg-white/10" onClick={handlePrevStep} disabled={currentStepIndex === 0}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] text-white hover:bg-white/10"
                  onClick={handleNextStep}
                  disabled={!session || currentStepIndex >= session.steps.length - 1}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </header>

            <div className="flex-1 min-h-0 bg-[#0b1220] overflow-hidden">
              <div
                className="h-full w-full min-h-0 grid"
                style={{ gridTemplateRows: currentChallengeStep ? `minmax(0, 1fr) 4px ${bottomPanelHeight}px` : 'minmax(0, 1fr)' }}
              >
                <div className="min-h-0 overflow-auto">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-sm text-white/60">Loading session...</div>
                  ) : error ? (
                    <div className="h-full flex items-center justify-center text-sm text-red-300">{error}</div>
                  ) : currentLessonStep ? (
                    <div className="h-full flex items-center justify-center px-8">
                      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
                        <div className="text-sm uppercase tracking-[0.2em] text-white/40 mb-3">Lesson Step</div>
                        <h3 className="text-2xl font-semibold mb-3">{currentLessonStep.visual.title}</h3>
                        <p className="text-sm text-white/65 mb-6">{currentLessonStep.visual.subtitle}</p>
                        <div className="space-y-3 text-left text-sm text-white/75">
                          {currentLessonStep.visual.bullets.map((bullet) => (
                            <div key={bullet} className="rounded-2xl bg-white/5 px-4 py-3 border border-white/5">
                              {bullet}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : currentChallengeStep && activeFile ? (
                    <div className="min-h-full grid" style={{ gridTemplateColumns: '46px 1fr' }}>
                      <div className="font-mono text-[12px] leading-5 text-right pr-3 text-white/35 select-none py-1">
                        {activeCodeLines.map((_, index) => (
                          <div key={`line-${index + 1}`}>{index + 1}</div>
                        ))}
                      </div>
                      <textarea
                        spellCheck={false}
                        value={activeFile.content}
                        onChange={(event) => handleCodeChange(event.target.value)}
                        rows={Math.max(activeCodeLines.length, 18)}
                        className="w-full h-full min-h-full resize-none border-0 bg-transparent px-0 py-1 pr-6 font-mono text-[12px] leading-5 text-white/85 outline-none"
                      />
                    </div>
                  ) : null}
                </div>

                {currentChallengeStep && (
                  <>
                    <div
                      className="bg-[#374151] hover:bg-[#4b5563] cursor-row-resize transition-colors"
                      onMouseDown={handleVerticalMouseDown}
                      style={{ height: '4px' }}
                    />

                    <div className="border-t border-white/10 bg-[#0a1526] flex flex-col min-h-0">
                      <div className="h-9 flex items-center gap-3 px-3 border-b border-white/10">
                        <button
                          type="button"
                          onClick={() => setBottomTab('ipython')}
                          className={cn(
                            'text-xs font-semibold px-2 py-1 rounded',
                            bottomTab === 'ipython' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                          )}
                        >
                          IPython Shell
                        </button>
                        <button
                          type="button"
                          onClick={() => setBottomTab('slides')}
                          className={cn(
                            'text-xs font-semibold px-2 py-1 rounded',
                            bottomTab === 'slides' ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white',
                          )}
                        >
                          Slides
                        </button>
                        {currentFiles.length > 1 ? (
                          <select
                            value={activeFile?.path || ''}
                            onChange={(event) => handleActiveFileChange(event.target.value)}
                            className="ml-auto h-6 rounded border border-white/10 bg-white/10 px-2 text-[10px] text-white outline-none"
                          >
                            {currentFiles.map((file) => (
                              <option key={file.path} value={file.path} className="text-black">
                                {file.path}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </div>

                      <div className="flex-1 min-h-0 overflow-auto px-3 py-2 font-mono text-[12px] text-white/85">
                        {bottomTab === 'ipython' ? (
                          <div className="space-y-1">
                            {shellOutput.map((line, index) => (
                              <div key={`${line}-${index}`} className="flex items-start gap-2">
                                <span className="text-green-400">{`Out[${index + 1}]:`}</span>
                                <span>{line}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-2 text-white/75">
                            {currentChallengeStep.exercise.expectedLogic.map((step, index) => (
                              <div key={`${currentChallengeStep.id}-${index}`} className="flex gap-2">
                                <span className="text-sky-300">{index + 1}.</span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>

        {!leftOpen && (
          <button
            type="button"
            onClick={() => setLeftOpen(true)}
            className="absolute left-3 top-20 h-8 px-3 rounded bg-white/10 hover:bg-white/15 text-xs font-semibold border border-white/10"
          >
            Exercise
          </button>
        )}
      </div>
    </div>
  )
}
