'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CodeSnippet {
  id: string
  title?: string
  filePath: string
  language: string
  code: string
  description?: string
}

interface Step {
  id: string
  number: number
  title: string
  completed: boolean
  estimatedTime: string
  objective: string
  codeSnippets: CodeSnippet[]
  markdown?: string
}

interface Lesson {
  id: string
  title: string
  steps: Step[]
}

interface CenterContentProps {
  lesson: Lesson
  currentStep: Step
  currentStepIndex: number
  totalSteps: number
  onNextStep: () => void
  onPrevStep: () => void
}

export function CenterContent({
  lesson,
  currentStep,
  currentStepIndex,
  totalSteps,
  onNextStep,
  onPrevStep
}: CenterContentProps) {
  const markdown = getStepMarkdown(currentStep)

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      <div className="px-8 py-6 border-b border-border bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{currentStep.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{currentStep.objective}</p>
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

      <div className="flex-1 overflow-y-auto px-15 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-5xl mx-auto"
        >
          <article className="prose prose-slate max-w-none prose-headings:text-foreground prose-p:text-foreground prose-p:leading-8 prose-strong:text-foreground prose-code:text-slate-100 prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-l-slate-300 prose-blockquote:text-muted-foreground prose-li:text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl font-semibold text-foreground mb-5">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-foreground mt-8 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-base leading-8 text-foreground mb-5">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-6">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-6">{children}</ol>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-slate-300 bg-slate-50 px-5 py-4 rounded-r-lg my-6 text-sm leading-7 text-muted-foreground">
                    {children}
                  </blockquote>
                ),
                pre: ({ children }: any) => {
                  const codeElement = children?.props
                  const className = codeElement?.className
                  const code = String(codeElement?.children ?? '').replace(/\n$/, '')
                  const isCompact = isShortCodeSnippet(code)

                  return isCompact ? (
                    <div className="my-4 overflow-x-auto rounded-lg bg-black px-3 py-2">
                      <SyntaxHighlighter
                        language={getLanguage(className)}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: 0,
                          background: '#000000',
                          fontSize: '0.82rem',
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
                    <Card className="my-6 overflow-hidden border-slate-800 bg-slate-950 shadow-lg">
                      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
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
                          fontSize: '0.875rem',
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
                    </Card>
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
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-900 ring-1 ring-slate-200 whitespace-normal break-words align-baseline"
                      {...props}
                    >
                      {code}
                    </code>
                  )
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        </motion.div>
      </div>
    </div>
  )
}

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

function getStepMarkdown(currentStep: Step): string {
  if (typeof currentStep.markdown === 'string' && currentStep.markdown.trim().length > 0) {
    return currentStep.markdown
  }

  const snippetSections = currentStep.codeSnippets
    .map((snippet, index) => {
      const title = snippet.title || `Snippet ${index + 1}`
      const description = snippet.description ? `${snippet.description}\n\n` : ''
      const language = snippet.language || 'text'
      return `## ${title}\n\n${description}\`\`\`${language}\n${snippet.code}\n\`\`\`\n\nRelated file: **${snippet.filePath}**`
    })
    .join('\n\n')

  return [
    `# ${currentStep.title}`,
    `## Objective\n\n${currentStep.objective}`,
    snippetSections,
  ]
    .map((section) => section.trim())
    .filter((section) => section.length > 0)
    .join('\n\n')
}
