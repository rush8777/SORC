'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  fetchPlaygroundSessions,
  getPlaygroundEditorUrl,
} from '@shared/integration/api'
import type {
  PlaygroundSessionCard,
} from '@shared/integration/types'

export default function PlaygroundSection() {
  const [generatedSessions, setGeneratedSessions] = useState<PlaygroundSessionCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.body.classList.add('ai-builder-dark-mode')
    document.documentElement.style.background = '#111214'

    return () => {
      document.body.classList.remove('ai-builder-dark-mode')
      document.documentElement.style.background = ''
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadSessions = async () => {
      try {
        const nextSessions = await fetchPlaygroundSessions()
        if (!cancelled) {
          setGeneratedSessions(nextSessions)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Unable to load generated challenges.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSessions()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="dashboard-section">
      <div className="dashboard-section__header">
        <div>
          <h2 className="dashboard-section__title">Play with code in your own codebase...</h2>
          <p className="dashboard-card__muted">
            Start challenge creation in the agent chat, let the assistant ask the right follow-up questions, and reopen any saved generated challenge from here.
          </p>
        </div>

        <a href="#" className="dashboard-inline-link">
          Explore all
          <ArrowUpRight size={16} />
        </a>
      </div>

      <article className="dashboard-card" style={{ marginBottom: 24 }}>
        <div className="dashboard-card__body" style={{ display: 'grid', gap: 14 }}>
          <div>
            <p className="dashboard-card__eyebrow">Agent Chat Flow</p>
            <h3 className="dashboard-card__title">Create challenges from the agent section</h3>
            <p className="dashboard-card__description">
              Use the existing chat interface to choose a project, describe what kind of coding challenge you want, answer the follow-up questions, and let the local agent generate the playground session for you.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button onClick={() => {
              window.location.hash = '#/ai-builder'
            }}>
              Open agent chat
            </Button>
            <p className="dashboard-card__muted">
              The project picker already lives inside the chat interface, so challenge generation now starts there instead of this page.
            </p>
          </div>

          {error ? <p className="dashboard-card__muted" style={{ color: '#fda4af' }}>{error}</p> : null}
        </div>
      </article>

      <div className="dashboard-section__header">
        <div>
          <h3 className="dashboard-projects__subheading">Generated Challenges</h3>
          <p className="dashboard-card__muted">
            Saved playground sessions from your real generated challenges. Click any card to jump straight back into the editor.
          </p>
        </div>
        <a href="#" className="dashboard-inline-link">
          Latest first
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="dashboard-grid dashboard-grid--project-ideas">
        {generatedSessions.map((sessionCard) => (
          <article key={sessionCard.id} className="dashboard-card">
            <div className="dashboard-card__body">
              <p className="dashboard-card__eyebrow">
                {sessionCard.projectName} • {formatDifficultyLabel(sessionCard.difficulty)}
              </p>
              <h3 className="dashboard-card__title">{sessionCard.title}</h3>
              <p className="dashboard-card__description">
                {truncatePrompt(sessionCard.prompt)}
              </p>
              <p className="dashboard-card__muted text-sm mb-1">
                Layer: {sessionCard.layerName}
              </p>
              <p className="dashboard-card__muted text-sm mb-1">
                Language: {formatLanguageLabel(sessionCard.language)}
              </p>
              <p className="dashboard-card__muted text-sm mb-3">
                {sessionCard.stepCount} steps • {formatSessionDate(sessionCard.createdAt)}
              </p>
            </div>

            <Button
              className="dashboard-card__action"
              variant="ghost"
              onClick={() => window.location.assign(getPlaygroundEditorUrl(sessionCard.id))}
            >
              Open challenge
            </Button>
          </article>
        ))}
      </div>

      {!loading && generatedSessions.length === 0 ? (
        <p className="dashboard-card__muted">No generated challenges yet. Create one from the agent chat and it will appear here as a reusable card.</p>
      ) : null}
    </section>
  )
}

function formatDifficultyLabel(value: PlaygroundSessionCard['difficulty']): string {
  return value[0].toUpperCase() + value.slice(1)
}

function formatLanguageLabel(value: PlaygroundSessionCard['language']): string {
  const cleaned = String(value).replace(/[_-]+/g, ' ').trim()
  if (!cleaned) {
    return 'Language'
  }

  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function truncatePrompt(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}...` : value
}

function formatSessionDate(isoValue: string): string {
  const date = new Date(isoValue)
  if (Number.isNaN(date.getTime())) {
    return 'saved earlier'
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
