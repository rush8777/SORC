'use client'

import type { CSSProperties, KeyboardEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bot,
  ChevronDown,
  Copy,
  FolderOpen,
  HelpCircle,
  Image,
  SendHorizontal,
  Share2,
  Sparkles,
  TerminalSquare,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { createPlaygroundSession, fetchProjects, getPlaygroundEditorUrl, sendAgentChatMessage } from '@shared/integration/api'
import type {
  LearningProject,
  PlaygroundChallengeDifficulty,
  PlaygroundPreferredLanguage,
} from '@shared/integration/types'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  meta?: string
}

type ChallengeDraft = {
  difficulty?: PlaygroundChallengeDifficulty
  language?: PlaygroundPreferredLanguage
  request?: string
}

type ChallengeFlowState = {
  active: boolean
  draft: ChallengeDraft
}

const STARTER_PROMPTS = [
  'Analyze and tell me what this project does',
  'Walk me through the architecture of this codebase',
  'Find the main entry points and explain how they connect',
  'What are the riskiest parts of this repository?',
]

const QUICK_ACTIONS = [
  { label: 'Create Images', icon: <Image size={13} /> },
  { label: 'Analyze Images', icon: <Sparkles size={13} /> },
  { label: 'Code', icon: <TerminalSquare size={13} /> },
]

export default function AiBuilderSection() {
  const [projects, setProjects] = useState<LearningProject[]>([])
  const [workspaceRoot, setWorkspaceRoot] = useState('')
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [sending, setSending] = useState(false)
  const [codeModeActive, setCodeModeActive] = useState(false)
  const [challengeFlow, setChallengeFlow] = useState<ChallengeFlowState>({
    active: false,
    draft: {},
  })

  useEffect(() => {
    document.body.classList.add('ai-builder-dark-mode')
    document.documentElement.style.background = '#111214'

    const loadProjects = async () => {
      try {
        const loadedProjects = await fetchProjects()
        setProjects(loadedProjects)
        if (loadedProjects[0]?.rootPath) {
          setWorkspaceRoot((currentValue) => currentValue || loadedProjects[0].rootPath)
        }
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Failed to load projects.')
      } finally {
        setLoadingProjects(false)
      }
    }

    loadProjects()

    return () => {
      document.body.classList.remove('ai-builder-dark-mode')
      document.documentElement.style.background = ''
    }
  }, [])

  const workspaceOptions = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: project.name,
        value: project.rootPath,
      })),
    [projects],
  )

  const recentCards = useMemo(() => {
    const userMessages = chatMessages.filter((entry) => entry.role === 'user').slice(-3).reverse()
    if (userMessages.length > 0) {
      return userMessages.map((entry) => ({
        id: entry.id,
        title: entry.content,
      }))
    }

    return STARTER_PROMPTS.slice(0, 3).map((prompt, index) => ({
      id: `starter-${index}`,
      title: prompt,
    }))
  }, [chatMessages])

  const selectedWorkspaceLabel =
    workspaceOptions.find((option) => option.value === workspaceRoot)?.label || 'Custom workspace'

  const handleSendMessage = async (nextMessage?: string) => {
    const prompt = (nextMessage ?? message).trim()
    if (!prompt || !workspaceRoot.trim()) {
      window.alert('Select or enter a workspace path and type a message first.')
      return
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      meta: workspaceRoot,
    }

    setChatMessages((currentMessages) => [...currentMessages, userMessage])
    setMessage('')

    if (codeModeActive || challengeFlow.active) {
      await handleChallengeConversation(prompt, challengeFlow.active)
      return
    }

    setSending(true)

    try {
      const result = await sendAgentChatMessage({
        message: prompt,
        verbose: true,
        workspaceRoot,
      })

      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${result.runId}`,
          role: 'assistant',
          content: result.reply,
          meta: `Run ID: ${result.runId}`,
        },
      ])
    } catch (error) {
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'The agent backend could not process this request.',
          meta: 'Request failed',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleChallengeConversation = async (prompt: string, wasActive: boolean) => {
    const nextDraft = mergeChallengeDraft(challengeFlow.draft, prompt, wasActive)
    setChallengeFlow({
      active: true,
      draft: nextDraft,
    })

    const followUpQuestion = buildChallengeFollowUpQuestion(nextDraft, selectedWorkspaceLabel, workspaceRoot)
    if (followUpQuestion) {
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-challenge-followup-${Date.now()}`,
          role: 'assistant',
          content: followUpQuestion,
          meta: 'Challenge guide',
        },
      ])
      return
    }

    setSending(true)

    try {
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-challenge-prep-${Date.now()}`,
          role: 'assistant',
          content:
            `I have enough to build your challenge for **${selectedWorkspaceLabel}**.\n\n` +
            `I’m asking the local agent to generate a guided playground with:\n` +
            `- language: ${formatLanguageForChat(nextDraft.language!)}\n` +
            `- difficulty: ${formatDifficultyForChat(nextDraft.difficulty!)}\n` +
            `- request: ${nextDraft.request!}\n\n` +
            `Opening the playground once the session is ready...`,
          meta: 'Challenge generation',
        },
      ])

      const result = await createPlaygroundSession({
        difficulty: nextDraft.difficulty,
        language: nextDraft.language,
        prompt: nextDraft.request,
        workspaceRoot,
      })

      setChallengeFlow({
        active: false,
        draft: {},
      })
      setCodeModeActive(false)

      window.location.assign(getPlaygroundEditorUrl(result.sessionId))
    } catch (error) {
      setChatMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-challenge-error-${Date.now()}`,
          role: 'assistant',
          content: error instanceof Error ? error.message : 'The challenge generator failed.',
          meta: 'Challenge generation failed',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const handleActivateChallengeMode = () => {
    if (!workspaceRoot.trim()) {
      window.alert('Choose a project in the chat interface first.')
      return
    }

    setCodeModeActive(true)
    setChallengeFlow({
      active: true,
      draft: {},
    })
    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `assistant-challenge-start-${Date.now()}`,
        role: 'assistant',
        content:
          `Let’s build a coding challenge from **${selectedWorkspaceLabel}**.\n\n` +
          `First, tell me what you want to learn from this project.\n\n` +
          `Examples:\n` +
          `- Teach me the API layer with a beginner coding challenge\n` +
          `- Turn the orchestration flow into a Python challenge\n` +
          `- Create a TypeScript debugging challenge from state management`,
        meta: 'Challenge guide',
      },
    ])
  }

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSendMessage()
    }
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      window.alert('Unable to copy message.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        style={{
          fontFamily: "'Instrument Sans', sans-serif",
          height: '100%',
          padding: 0,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            margin: 0,
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.05)',
            background: 'linear-gradient(180deg, #1a1b20 0%, #18191e 100%)',
            boxShadow: 'none',
            overflow: 'hidden',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              padding: '18px 22px 0',
            }}
          >
            <div style={{ display: 'grid', gap: 4 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#f5f6fb' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Gemini</span>
                <ChevronDown size={14} color="#7d828d" />
              </div>
              <span style={{ fontSize: 11, color: '#6f7480' }}>Live backend workspace mode</span>
            </div>

                      </header>

          <div
            style={{
              display: 'grid',
              gridTemplateRows: chatMessages.length === 0 ? '1fr auto' : '1fr',
              padding: '1rem 2rem 0.5rem',
              minHeight: 0,
            }}
          >
            {chatMessages.length === 0 ? (
              <div
                style={{
                  alignSelf: 'center',
                  width: 'min(100%, 720px)',
                  margin: '0 auto',
                  display: 'grid',
                  gap: 18,
                }}
              >
                <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center', gap: 8 }}>
                  <div style={heroBadge}>Using live workspace agent</div>
                  <h1 style={{ margin: 0, color: '#f8f8fb', fontSize: 40, fontWeight: 600, letterSpacing: '-0.05em' }}>
                    Good evening, builder
                  </h1>
                  <p style={{ margin: 0, color: '#696d78', fontSize: 13 }}>
                    Chat with the agent backend and turn your live codebase into answers, lessons, and analysis.
                  </p>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      style={quickActionButton}
                      onClick={() => {
                        if (action.label === 'Code') {
                          handleActivateChallengeMode()
                          return
                        }
                        setMessage((current) => current || action.label)
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#a4a8b3', fontSize: 13 }}>
                    <span style={tinySquare} />
                    Your Recent Chats
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {recentCards.map((card) => (
                      <button key={card.id} type="button" style={recentCardButton} onClick={() => setMessage(card.title)}>
                        <span style={recentCardIcon}>
                          <Bot size={13} />
                        </span>
                        <span style={recentCardTitle}>{truncate(card.title, 62)}</span>
                        <span style={recentCardMeta}>Click to use this prompt</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  width: 'min(100%, 820px)',
                  margin: '0 auto',
                  display: 'grid',
                  gap: 22,
                  alignContent: 'start',
                  overflowY: 'auto',
                  paddingRight: 4,
                }}
              >
                {chatMessages.map((chatMessage) =>
                  chatMessage.role === 'user' ? (
                    <article key={chatMessage.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={avatarCircle}>
                        <span style={{ fontSize: 12, fontWeight: 700 }}>U</span>
                      </div>
                      <div style={userBubble}>{chatMessage.content}</div>
                    </article>
                  ) : (
                    <article key={chatMessage.id} style={{ display: 'grid', gap: 10 }}>
                      <div style={assistantCard}>
                        <div style={{ display: 'grid', gap: 10 }}>
                          <div style={{ color: '#f5f6fb', fontSize: 14, fontWeight: 600 }}>Agent reply</div>
                          <div style={assistantContent}>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p style={{ margin: '0 0 12px' }}>{children}</p>,
                                ul: ({ children }) => (
                                  <ul style={{ margin: '0 0 12px', paddingLeft: 18, display: 'grid', gap: 6 }}>{children}</ul>
                                ),
                                ol: ({ children }) => (
                                  <ol style={{ margin: '0 0 12px', paddingLeft: 18, display: 'grid', gap: 6 }}>{children}</ol>
                                ),
                                li: ({ children }) => <li style={{ margin: 0 }}>{children}</li>,
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#9fb4ff', textDecoration: 'underline', textUnderlineOffset: 2 }}
                                  >
                                    {children}
                                  </a>
                                ),
                                code: ({ children, className }) => {
                                  const isBlock = Boolean(className?.includes('language-'))
                                  if (isBlock) {
                                    return <code className={className}>{children}</code>
                                  }

                                  return (
                                    <code
                                      style={{
                                        padding: '0.12rem 0.35rem',
                                        borderRadius: 8,
                                        background: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        fontSize: '0.92em',
                                      }}
                                    >
                                      {children}
                                    </code>
                                  )
                                },
                                pre: ({ children }) => (
                                  <pre
                                    style={{
                                      margin: '0 0 12px',
                                      padding: 12,
                                      borderRadius: 14,
                                      background: '#111214',
                                      border: '1px solid rgba(255,255,255,0.06)',
                                      overflowX: 'auto',
                                    }}
                                  >
                                    {children}
                                  </pre>
                                ),
                                blockquote: ({ children }) => (
                                  <blockquote
                                    style={{
                                      margin: '0 0 12px',
                                      padding: '8px 12px',
                                      borderLeft: '3px solid rgba(255,255,255,0.18)',
                                      background: 'rgba(255,255,255,0.03)',
                                      borderRadius: 12,
                                      color: '#c9cede',
                                    }}
                                  >
                                    {children}
                                  </blockquote>
                                ),
                              }}
                            >
                              {chatMessage.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        <div style={assistantFooter}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <button type="button" style={messageIconButton}>
                              <ThumbsUp size={14} />
                            </button>
                            <button type="button" style={messageIconButton}>
                              <ThumbsDown size={14} />
                            </button>
                          </div>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                            <button type="button" style={messageActionButton} onClick={() => void handleCopy(chatMessage.content)}>
                              <Copy size={13} />
                              Copy
                            </button>
                            <button type="button" style={messageActionButton}>
                              <Share2 size={13} />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                      {chatMessage.meta ? <span style={{ color: '#676c78', fontSize: 11 }}>{chatMessage.meta}</span> : null}
                    </article>
                  ),
                )}

                {sending ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: '#8b91a0', fontSize: 13 }}>
                    <span style={typingDot} />
                    Agent is working through your request...
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <footer
            style={{
              padding: '0 2rem 2rem',
            }}
          >
            <div style={{ width: 'min(100%, 720px)', margin: '0 auto', display: 'grid', gap: 14 }}>
              {chatMessages.length > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    style={regenerateButton}
                    disabled={sending || chatMessages.length === 0}
                    onClick={() => {
                      const lastUserPrompt = [...chatMessages].reverse().find((entry) => entry.role === 'user')?.content
                      if (lastUserPrompt) {
                        void handleSendMessage(lastUserPrompt)
                      }
                    }}
                  >
                    Regenerate
                  </button>
                </div>
              ) : null}

              <div style={composerCard}>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={codeModeActive ? 'Describe the coding challenge you want, then answer follow-up questions...' : 'Ask the agent...'}
                  rows={4}
                  style={composerTextarea}
                />

                <div style={composerBottomBar}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!workspaceRoot.trim()) {
                          window.alert('Choose a project first before enabling code mode.')
                          return
                        }

                        setCodeModeActive((current) => {
                          const next = !current
                          if (!next) {
                            setChallengeFlow({
                              active: false,
                              draft: {},
                            })
                          } else {
                            setChallengeFlow({
                              active: true,
                              draft: {},
                            })
                          }
                          return next
                        })
                      }}
                      style={{
                        ...workspacePill,
                        background: codeModeActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                        color: codeModeActive ? '#ffffff' : '#dbe0ec',
                        cursor: 'pointer',
                      }}
                    >
                      <FolderOpen size={12} />
                      {codeModeActive ? 'Code mode on' : 'Code mode'}
                    </button>
                    <select
                      value={workspaceOptions.some((option) => option.value === workspaceRoot) ? workspaceRoot : ''}
                      onChange={(event) => setWorkspaceRoot(event.target.value)}
                      style={compactWorkspaceSelect}
                    >
                      <option value="">{loadingProjects ? 'Loading...' : 'Choose project'}</option>
                      {workspaceOptions.map((option) => (
                        <option key={option.id} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#707684', fontSize: 12 }}>verbose mode</span>
                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={sending || !message.trim() || !workspaceRoot.trim()}
                      style={sendButton}
                    >
                      <SendHorizontal size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

function mergeChallengeDraft(currentDraft: ChallengeDraft, prompt: string, wasActive: boolean): ChallengeDraft {
  const normalizedPrompt = prompt.trim()
  const nextDraft: ChallengeDraft = {
    difficulty: currentDraft.difficulty ?? parseDifficultyFromText(normalizedPrompt),
    language: currentDraft.language ?? parseLanguageFromText(normalizedPrompt),
    request: currentDraft.request,
  }

  if (!nextDraft.request) {
    nextDraft.request = normalizedPrompt
  } else if (wasActive && !parseDifficultyFromText(normalizedPrompt) && !parseLanguageFromText(normalizedPrompt)) {
    nextDraft.request = `${nextDraft.request}\nAdditional preference: ${normalizedPrompt}`
  }

  return nextDraft
}

function buildChallengeFollowUpQuestion(
  draft: ChallengeDraft,
  selectedWorkspaceLabel: string,
  workspaceRoot: string,
): string | null {
  if (!workspaceRoot.trim()) {
    return 'Choose a project first from the project selector at the bottom of the chat, then I can build the challenge from that codebase.'
  }

  if (!draft.request) {
    return `Tell me what kind of coding challenge you want from **${selectedWorkspaceLabel}**. You can mention a layer, flow, bug, or concept you want to practice.`
  }

  if (!draft.language) {
    return `Nice. Which language should I teach and challenge you in for **${selectedWorkspaceLabel}**? (Example: TypeScript, JavaScript, Python, Go, Rust, etc.)`
  }

  if (!draft.difficulty) {
    return `Great. What difficulty do you want for this challenge: beginner, intermediate, or hard?`
  }

  return null
}

function parseLanguageFromText(value: string): PlaygroundPreferredLanguage | undefined {
  const normalized = value.toLowerCase()

  const explicitMatch = normalized.match(/\b(language|lang)\s*[:=]\s*([a-z0-9_+.-]+)\b/i)
  if (explicitMatch?.[2]) {
    return explicitMatch[2]
  }

  if (normalized.includes('python')) return 'python'
  if (normalized.includes('javascript') || normalized.includes('js ') || normalized.endsWith(' js')) return 'javascript'
  if (normalized.includes('typescript') || normalized.includes('ts ') || normalized.endsWith(' ts')) return 'typescript'

  const inMatch = normalized.match(/\bin\s+([a-z0-9_+.-]+)\b/i)
  if (inMatch?.[1] && inMatch[1].length >= 2) {
    return inMatch[1]
  }

  return undefined
}

function parseDifficultyFromText(value: string): PlaygroundChallengeDifficulty | undefined {
  const normalized = value.toLowerCase()
  if (normalized.includes('intermediate')) {
    return 'intermediate'
  }
  if (normalized.includes('hard') || normalized.includes('advanced')) {
    return 'hard'
  }
  if (normalized.includes('beginner') || normalized.includes('easy')) {
    return 'beginner'
  }
  return undefined
}

function formatLanguageForChat(value: PlaygroundPreferredLanguage): string {
  const cleaned = String(value).replace(/[_-]+/g, ' ').trim()
  if (!cleaned) {
    return 'Language'
  }

  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDifficultyForChat(value: PlaygroundChallengeDifficulty): string {
  return value[0].toUpperCase() + value.slice(1)
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, Math.max(0, maxLength - 1))}…` : value
}

const headerActionButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.02)',
  color: '#d8dbe6',
  padding: '0.65rem 0.85rem',
  fontSize: 12,
  cursor: 'pointer',
}

const heroBadge: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  padding: '0.35rem 0.75rem',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  color: '#9ea3af',
  fontSize: 11,
}

const quickActionButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.06)',
  background: '#191a20',
  color: '#cfd2dc',
  padding: '0.52rem 0.78rem',
  fontSize: 11.5,
  cursor: 'pointer',
}

const tinySquare: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 2,
  border: '1px solid rgba(255,255,255,0.16)',
  display: 'inline-block',
  flexShrink: 0,
}

const recentCardButton: CSSProperties = {
  display: 'grid',
  gap: 9,
  minHeight: 118,
  padding: 14,
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.05)',
  background: '#1a1a1d',
  color: '#edf0f8',
  textAlign: 'left',
  cursor: 'pointer',
}

const recentCardIcon: CSSProperties = {
  width: 20,
  height: 20,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.04)',
  color: '#9ea3b2',
}

const recentCardTitle: CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.45,
  color: '#f2f4fb',
}

const recentCardMeta: CSSProperties = {
  fontSize: 11,
  color: '#666a74',
}

const avatarCircle: CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #f0bea8 0%, #b57560 100%)',
  color: '#fff',
  flexShrink: 0,
  boxShadow: '0 8px 18px rgba(0,0,0,0.16)',
}

const userBubble: CSSProperties = {
  maxWidth: 380,
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.06)',
  background: '#21232b',
  color: '#eef1f8',
  padding: '12px 14px',
  fontSize: 13.5,
  lineHeight: 1.55,
}

const assistantCard: CSSProperties = {
  display: 'grid',
  gap: 16,
  borderRadius: 18,
  background: '#20212a',
  border: '1px solid rgba(255,255,255,0.05)',
  padding: '16px 18px',
  color: '#eef1f8',
  boxShadow: '0 14px 28px rgba(0,0,0,0.14)',
}

const assistantContent: CSSProperties = {
  fontSize: 13.5,
  lineHeight: 1.72,
  color: '#dfe3ef',
}

const assistantFooter: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  paddingTop: 12,
}

const messageIconButton: CSSProperties = {
  width: 30,
  height: 30,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.06)',
  background: 'transparent',
  color: '#cfd4e2',
  cursor: 'pointer',
}

const messageActionButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: 0,
  background: 'transparent',
  color: '#cfd4e2',
  fontSize: 12.5,
  cursor: 'pointer',
}

const typingDot: CSSProperties = {
  width: 9,
  height: 9,
  borderRadius: 999,
  background: '#7f879a',
  display: 'inline-block',
}

const regenerateButton: CSSProperties = {
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  background: '#23242c',
  color: '#dde1ec',
  padding: '0.7rem 1rem',
  fontSize: 12.5,
  cursor: 'pointer',
}

const composerCard: CSSProperties = {
  display: 'grid',
  gap: 12,
  padding: 16,
  borderRadius: 18,
  background: 'linear-gradient(180deg, #202127 0%, #1b1c22 100%)',
  border: '1px solid rgba(255,255,255,0.05)',
}

const composerTextarea: CSSProperties = {
  width: '100%',
  minHeight: 92,
  border: 0,
  resize: 'none',
  background: 'transparent',
  color: '#f7f8fc',
  fontSize: 14,
  lineHeight: 1.7,
  outline: 'none',
  fontFamily: "'Instrument Sans', sans-serif",
}

const composerBottomBar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  flexWrap: 'wrap',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  paddingTop: 12,
}

const workspacePill: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  border: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(255,255,255,0.03)',
  color: '#dbe0ec',
  padding: '0.45rem 0.7rem',
  fontSize: 12,
}

const compactWorkspaceSelect: CSSProperties = {
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.05)',
  background: '#24252d',
  color: '#e3e6ef',
  padding: '0.5rem 0.65rem',
  fontSize: 12,
  outline: 'none',
}

const sendButton: CSSProperties = {
  width: 36,
  height: 36,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  borderRadius: 999,
  background: 'linear-gradient(180deg, #f3f4f8 0%, #ced2dc 100%)',
  color: '#14161d',
  cursor: 'pointer',
}
