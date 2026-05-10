'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  X,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Code2,
  EllipsisVertical,
  FileText,
  FolderOpen,
  Filter,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { analyzeLayerLesson, analyzeProject, fetchProjects } from '@shared/integration/api'
import type { AnalyzeProjectPayload, LearningProject, ProjectLesson, UploadedProjectFile } from '@shared/integration/types'

type LessonCard = {
  eyebrow: string
  title: string
  description: string
  stats: string
  level: string
  duration: string
  files: string
  tone: 'green' | 'blue' | 'amber' | 'violet'
  lessonId: string
}

type LessonGroup = {
  title: string
  subtitle: string
  count: number
  cards: LessonCard[]
}

const projectTabs = ['All projects', 'In progress', 'Completed', 'Drafts'] as const

const ideas = [
  {
    title: 'AI Chatbot with RAG',
    description: 'Build a support-ready chatbot using your own docs, changelogs, and internal notes.',
    tags: ['Python', 'AI'],
  },
  {
    title: 'Bug Tracker App',
    description: 'Create a full-stack tracker with sprint status, assignment flow, and live updates.',
    tags: ['JavaScript', 'Full Stack'],
  },
  {
    title: 'Code Review Assistant',
    description: 'Design a reviewer companion that summarizes diffs, surfaces risks, and suggests tests.',
    tags: ['TypeScript', 'AI'],
  },
] as const

type ProjectsSectionProps = {
  onOpenProject: (projectId: string) => void
  onOpenLesson: (projectId: string, lessonId: string) => void
  onBackToProjects?: () => void
  showDetail?: boolean
  selectedProjectId?: string | null
}

type FileSystemDirectoryHandleLike = {
  kind: 'directory'
  name: string
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemDirectoryHandleLike>
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<FileSystemFileHandleLike>
  queryPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (descriptor?: { mode?: 'read' | 'readwrite' }) => Promise<PermissionState>
  values?: () => AsyncIterable<any>
}

type FileSystemFileHandleLike = {
  getFile: () => Promise<File>
}

type LayerSummary = {
  id: string
  name: string
  description: string
  files: string[]
}

type ProjectSelection = {
  payload: AnalyzeProjectPayload
  directoryHandle?: FileSystemDirectoryHandleLike | null
}

const projectDirectoryHandles = new Map<string, FileSystemDirectoryHandleLike>()

export default function ProjectsSection({
  onOpenProject,
  onOpenLesson,
  onBackToProjects,
  showDetail = false,
  selectedProjectId = null,
}: ProjectsSectionProps) {
  const [projects, setProjects] = useState<LearningProject[]>([])
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadProjects = async () => {
      try {
        const nextProjects = await fetchProjects()
        if (!cancelled) {
          setProjects(nextProjects)
        }
      } catch (error) {
        if (!cancelled) {
          window.alert(error instanceof Error ? error.message : 'Failed to load projects.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      cancelled = true
    }
  }, [])

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  )

  const projectStats = useMemo(() => buildProjectStats(projects), [projects])

  const handleCreateProject = async () => {
    try {
      let selection = await pickProjectFolderFromDirectoryHandle()
      if (!selection) {
        selection = await pickProjectFolder(fileInputRef.current)
      }

      if (!selection) {
        return
      }

      setIsAnalyzing(true)
      const createdProject = await analyzeProject(selection.payload)
      registerProjectDirectoryHandle(createdProject, selection.directoryHandle)
      setProjects((currentProjects) => [createdProject, ...currentProjects.filter((project) => project.id !== createdProject.id)])
      onOpenProject(createdProject.id)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      window.alert(error instanceof Error ? error.message : 'Unable to analyze the selected project.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (showDetail) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: 'none' }}
          {...({ webkitdirectory: '', directory: '' } as any)}
        />
        <ProjectLearningDetail
          project={selectedProject}
          loading={loading}
          onBackToProjects={onBackToProjects ?? (() => {})}
          onOpenLesson={onOpenLesson}
        />
        <ProjectTripPlanner
          project={selectedProject}
          onProjectUpdated={(nextProject) =>
            setProjects((currentProjects) =>
              currentProjects.map((project) => (project.id === nextProject.id ? nextProject : project)),
            )
          }
        />
      </>
    )
  }

  return (
    <section className="dashboard-section dashboard-projects">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        {...({ webkitdirectory: '', directory: '' } as any)}
      />

      <div className="dashboard-section__header dashboard-projects__hero">
        <div>
          <p className="dashboard-card__eyebrow">Projects workspace</p>
          <h2 className="dashboard-section__title">Build and track your strongest work</h2>
          <p className="dashboard-projects__intro">
            Keep active builds moving, monitor momentum, and turn finished work into portfolio-ready proof.
          </p>
        </div>

        <Button className="dashboard-projects__hero-action" onClick={handleCreateProject} disabled={isAnalyzing}>
          <Sparkles size={16} />
          {isAnalyzing ? 'Analyzing project...' : 'New project'}
        </Button>
      </div>

      <div className="dashboard-grid dashboard-grid--project-stats">
        {projectStats.map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.label} className="dashboard-card dashboard-project-stat">
              <div className="dashboard-card__body">
                <div className="dashboard-project-stat__header">
                  <div>
                    <p className="dashboard-card__eyebrow">{stat.label}</p>
                    <h3 className="dashboard-project-stat__value">{stat.value}</h3>
                  </div>
                  <div className={`dashboard-project-stat__icon dashboard-project-stat__icon--${stat.tone}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <p className="dashboard-card__muted">{stat.note}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="dashboard-card dashboard-projects__panel">
        <div className="dashboard-card__body">
          <div className="dashboard-projects__toolbar">
            <div className="dashboard-projects__tabs" role="tablist" aria-label="Project filters">
              {projectTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={index === 0 ? 'dashboard-projects__tab dashboard-projects__tab--active' : 'dashboard-projects__tab'}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="dashboard-projects__filters">
              <button type="button" className="dashboard-projects__filter">
                All languages
              </button>
              <button type="button" className="dashboard-projects__filter">
                <Filter size={14} />
                Recent
              </button>
            </div>
          </div>

          <div className="dashboard-projects__list">
            {loading ? (
              <article className="dashboard-project-item">
                <div className="dashboard-project-item__content">
                  <p className="dashboard-project-item__description">Loading projects...</p>
                </div>
              </article>
            ) : projects.length === 0 ? (
              <article className="dashboard-project-item">
                <div className="dashboard-project-item__content">
                  <p className="dashboard-project-item__description">
                    Create your first project to generate understanding and data flow lessons.
                  </p>
                </div>
              </article>
            ) : (
              projects.map((project) => (
                <article key={project.id} className="dashboard-project-item">
                  <div className="dashboard-project-item__identity">
                    <div className="dashboard-project-item__badge dashboard-project-item__badge--accent">
                      <Code2 size={18} />
                    </div>

                    <div className="dashboard-project-item__content">
                      <div className="dashboard-project-item__title-row">
                        <h3 className="dashboard-project-item__title">{project.name}</h3>
                        <span className="dashboard-project-item__status dashboard-project-item__status--in-progress">
                          Ready
                        </span>
                      </div>

                      <p className="dashboard-project-item__description">{project.description}</p>

                      <div className="dashboard-project-item__meta">
                        <span className="dashboard-project-item__pill">{project.framework}</span>
                        <span>{formatUpdatedLabel(project.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-project-item__aside">
                    <button type="button" className="dashboard-project-item__menu" aria-label={`More options for ${project.name}`}>
                      <EllipsisVertical size={18} />
                    </button>

                    <div className="dashboard-project-item__progress">
                      <div className="dashboard-project-item__progress-row">
                        <span>Progress</span>
                        <strong>{project.progress}%</strong>
                      </div>
                      <div className="dashboard-project-item__progress-bar" aria-hidden="true">
                        <span style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>

                    <Button className="dashboard-project-item__action" onClick={() => onOpenProject(project.id)}>
                      Open project
                    </Button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-section__header">
        <div>
          <h3 className="dashboard-projects__subheading">Suggested project ideas</h3>
          <p className="dashboard-card__muted">
            Fresh directions that fit the same product-building flow as the rest of your dashboard.
          </p>
        </div>
        <a href="#" className="dashboard-inline-link">
          View all ideas
          <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="dashboard-grid dashboard-grid--project-ideas">
        {ideas.map((idea, index) => (
          <article key={idea.title} className="dashboard-card dashboard-project-idea">
            <div className="dashboard-card__body">
              <div className={`dashboard-project-idea__mark dashboard-project-idea__mark--${index + 1}`}>
                <Sparkles size={16} />
              </div>
              <h4 className="dashboard-project-idea__title">{idea.title}</h4>
              <p className="dashboard-project-idea__description">{idea.description}</p>
              <div className="dashboard-project-idea__tags">
                {idea.tags.map((tag) => (
                  <span key={`${idea.title}-${tag}`} className="dashboard-project-idea__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <Button className="dashboard-project-idea__action" variant="ghost">
              Start project
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}

function ProjectTripPlanner({
  project,
  onProjectUpdated,
}: {
  project: LearningProject | null
  onProjectUpdated: (project: LearningProject) => void
}) {
  const [layers, setLayers] = useState<LayerSummary[]>([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzingLayerId, setAnalyzingLayerId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadLayers = async () => {
      if (!project) {
        setLayers([])
        setSelectedLayerId(null)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const layerIndex = await readProjectLayerIndex(project)
        if (cancelled) {
          return
        }

        setLayers(layerIndex)
        setSelectedLayerId((currentSelectedId) =>
          currentSelectedId && layerIndex.some((layer) => layer.id === currentSelectedId) ? currentSelectedId : null,
        )
      } catch (nextError) {
        if (cancelled) {
          return
        }

        setLayers([])
        setSelectedLayerId(null)
        setError(nextError instanceof Error ? nextError.message : 'Unable to load the layer index.')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadLayers()

    return () => {
      cancelled = true
    }
  }, [project])

  const selectedLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId],
  )

  const rows = useMemo(() => chunkLayers(layers, 5), [layers])

  const handleAnalyzeLayer = async () => {
    if (!project || !selectedLayer) {
      return
    }

    try {
      setAnalyzingLayerId(selectedLayer.id)
      const result = await analyzeLayerLesson(project.id, selectedLayer.name)
      onProjectUpdated(result.project)
      setSelectedLayerId(null)
    } catch (nextError) {
      window.alert(nextError instanceof Error ? nextError.message : 'Unable to analyze this layer.')
    } finally {
      setAnalyzingLayerId(null)
    }
  }

  useEffect(() => {
    if (!selectedLayer) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedLayerId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedLayer])

  return (
    <section className="dashboard-section dashboard-trip-planner" aria-label="Trip planner">
      <div className="dashboard-card dashboard-trip-planner__card">
        <div className="dashboard-card__body dashboard-trip-planner__body">
          <p className="dashboard-card__eyebrow dashboard-trip-planner__eyebrow">find more on your codebase</p>
          <h3 className="dashboard-trip-planner__title">Suggestions</h3>

          {loading ? <p className="dashboard-card__muted">Loading analyzed layers...</p> : null}
          {!loading && error ? <p className="dashboard-card__muted">{error}</p> : null}
          {!loading && !error && rows.length === 0 ? (
            <p className="dashboard-card__muted">No analyzed layers were found in `.agent/layer-index.json`.</p>
          ) : null}

          {!loading && !error && rows.length > 0 ? (
            <div className="dashboard-trip-planner__rows" role="list" aria-label="Analyzed codebase layers">
              {rows.map((row, rowIndex) => (
                <div key={`layer-row-${rowIndex + 1}`} className="dashboard-trip-planner__row" role="listitem">
                  <div className="dashboard-trip-planner__pills" role="group" aria-label={`Layer row ${rowIndex + 1}`}>
                    {row.map((layer, layerIndex) => {
                      const isActive = layerIndex % 2 === 1
                      return (
                        <button
                          key={layer.id}
                          type="button"
                          className={
                            isActive
                              ? 'dashboard-project-item__pill dashboard-trip-planner__pill dashboard-trip-planner__pill--active'
                              : 'dashboard-project-item__pill dashboard-trip-planner__pill'
                          }
                          onClick={() => setSelectedLayerId(layer.id)}
                        >
                          {layer.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {selectedLayer ? (
        <div className="dashboard-layer-modal" role="dialog" aria-modal="true" aria-labelledby="layer-modal-title">
          <div className="dashboard-layer-modal__backdrop" onClick={() => setSelectedLayerId(null)} />
          <div className="dashboard-layer-modal__panel">
            <button
              type="button"
              className="dashboard-layer-modal__close"
              aria-label="Close layer details"
              onClick={() => setSelectedLayerId(null)}
            >
              <X size={18} />
            </button>

            <div className="dashboard-layer-modal__content">
              <p className="dashboard-card__eyebrow">Analyzed layer</p>
              <h4 id="layer-modal-title" className="dashboard-layer-modal__title">
                {selectedLayer.name}
              </h4>

              <div className="dashboard-layer-modal__section">
                <h5>Description</h5>
                <p>{selectedLayer.description || 'No description was provided for this layer.'}</p>
              </div>

              <div className="dashboard-layer-modal__section">
                <h5>Files</h5>
                {selectedLayer.files.length > 0 ? (
                  <div className="dashboard-layer-modal__files" role="list" aria-label={`${selectedLayer.name} files`}>
                    {selectedLayer.files.map((filePath) => (
                      <span key={`${selectedLayer.id}-${filePath}`} className="dashboard-layer-modal__file" role="listitem">
                        {filePath}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No files were listed for this layer.</p>
                )}
              </div>
            </div>

            <div className="dashboard-layer-modal__footer">
              <Button
                type="button"
                className="dashboard-layer-modal__action"
                onClick={handleAnalyzeLayer}
                disabled={analyzingLayerId === selectedLayer.id}
              >
                {analyzingLayerId === selectedLayer.id ? 'Analyzing layer...' : 'Analyze this layer'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ProjectLearningDetail({
  loading,
  project,
  onBackToProjects,
  onOpenLesson,
}: {
  loading: boolean
  project: LearningProject | null
  onBackToProjects: () => void
  onOpenLesson: (projectId: string, lessonId: string) => void
}) {
  const [showCommandsModal, setShowCommandsModal] = useState(false)
  const learningGroups = useMemo(() => buildLearningGroups(project?.lessons ?? []), [project])

  if (loading) {
    return (
      <section className="dashboard-section dashboard-project-detail">
        <button type="button" className="dashboard-project-detail__back" onClick={onBackToProjects}>
          <ArrowLeft size={16} />
          Projects
        </button>
        <p className="dashboard-card__muted">Loading project...</p>
      </section>
    )
  }

  if (!project) {
    return (
      <section className="dashboard-section dashboard-project-detail">
        <button type="button" className="dashboard-project-detail__back" onClick={onBackToProjects}>
          <ArrowLeft size={16} />
          Projects
        </button>
        <p className="dashboard-card__muted">This project could not be found.</p>
      </section>
    )
  }

  return (
    <section className="dashboard-section dashboard-project-detail">
      <button type="button" className="dashboard-project-detail__back" onClick={onBackToProjects}>
        <ArrowLeft size={16} />
        Projects
      </button>

      <div className="dashboard-project-detail__breadcrumb" aria-label="Breadcrumb">
        <span>Catalog</span>
        <span>/</span>
        <span>{project.name}</span>
      </div>

      <div className="dashboard-project-detail__hero">
        <div className="dashboard-project-detail__hero-top">
          <div className="dashboard-project-detail__hero-copy">
            <h2 className="dashboard-project-detail__title">{project.name}</h2>
            <p className="dashboard-project-detail__lede">
              {project.description}
            </p>
            <div className="dashboard-project-detail__meta">
              <span>{project.visibility}</span>
              <span>{formatUpdatedLabel(project.updatedAt)}</span>
              <span>{project.files}</span>
              <span>{project.contributors}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-project-detail__content">
          <div className="dashboard-project-detail__about">
            <h3>About {project.name}</h3>
            <p>
              {project.description}
            </p>
            <div style={{ marginTop: '12px' }}>
              <Button className="dashboard-project-detail__commands-btn" onClick={() => setShowCommandsModal(true)}>
                Commands
              </Button>
            </div>
          </div>

          <div className="dashboard-project-detail__topics">
            <h3>Tech Stack Used</h3>
            <div className="dashboard-project-detail__topics-grid" role="list" aria-label="Related topics">
              {[
                { name: 'React', icon: '/assets/icons/react-logo.svg' },
                { name: 'HTML', icon: '/assets/icons/html5-logo.svg' },
                { name: 'CSS', icon: '/assets/icons/css3-logo.svg' }
              ].map((tech) => (
                <a 
                  key={tech.name} 
                  href="#" 
                  className="dashboard-project-detail__topic" 
                  role="listitem"
                  title={tech.name}
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px'
                  }}
                >
                  <img 
                    src={tech.icon} 
                    alt={tech.name} 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      display: 'block'
                    }} 
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    whiteSpace: 'nowrap'
                  }}>
                    {tech.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-project-detail__progress-strip">
          <div className="dashboard-project-detail__progress-header">
            <span>Progress</span>
            <strong>{project.progress}%</strong>
          </div>
          <div className="dashboard-project-detail__progress-bar" aria-hidden="true">
            <span style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="dashboard-project-detail__sections">
        {learningGroups.map((group) => (
          <section key={group.title} className="dashboard-section">
            <div className="dashboard-section__header dashboard-project-detail__section-header">
              <div>
                <h3 className="dashboard-projects__subheading">{group.title}</h3>
                <p className="dashboard-card__muted">{group.subtitle}</p>
              </div>
              <a href="#" className="dashboard-inline-link">
                View all ({group.count})
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="dashboard-grid dashboard-grid--project-lessons-three">
              {group.cards.map((card) => (
                <article
                  key={`${group.title}-${card.lessonId}`}
                  className={`dashboard-recommendation dashboard-project-lesson dashboard-project-lesson--${card.tone}`}
                >
                  <div className="dashboard-recommendation__body">
                    <span className="dashboard-recommendation__tag">{card.eyebrow}</span>
                    <h4 className="dashboard-recommendation__title">{card.title}</h4>
                    <p className="dashboard-recommendation__description">{card.description}</p>
                    <div className="dashboard-recommendation__stats">{card.stats}</div>

                    <div className="dashboard-recommendation__details dashboard-project-lesson__details">
                      <div className="dashboard-recommendation__detail">
                        <Users size={16} />
                        <span>{card.level}</span>
                      </div>
                      <div className="dashboard-recommendation__detail">
                        <Clock3 size={16} />
                        <span>{card.duration}</span>
                      </div>
                      <div className="dashboard-recommendation__detail">
                        <FileText size={16} />
                        <span>{card.files}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="dashboard-recommendation__action" variant="ghost" onClick={() => onOpenLesson(project.id, card.lessonId)}>
                    Open lesson
                  </Button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      {showCommandsModal && (
        <div className="dashboard-commands-modal" role="dialog" aria-modal="true" aria-labelledby="commands-modal-title">
          <div className="dashboard-commands-modal__backdrop" onClick={() => setShowCommandsModal(false)} />
          <div className="dashboard-commands-modal__panel">
            <button
              type="button"
              className="dashboard-commands-modal__close"
              aria-label="Close commands modal"
              onClick={() => setShowCommandsModal(false)}
            >
              <X size={18} />
            </button>

            <div className="dashboard-commands-modal__content">
              <h3 id="commands-modal-title" className="dashboard-commands-modal__title">
                Commands
              </h3>

              <div className="dashboard-commands-modal__buttons">
                <button 
                  type="button" 
                  className="dashboard-commands-modal__button"
                  onClick={() => {
                    console.log('Start Index clicked')
                    setShowCommandsModal(false)
                  }}
                >
                  <span className="dashboard-commands-modal__button-text">Start Index</span>
                </button>

                <button 
                  type="button" 
                  className="dashboard-commands-modal__button"
                  onClick={() => {
                    console.log('Generate fundamentals clicked')
                    setShowCommandsModal(false)
                  }}
                >
                  <span className="dashboard-commands-modal__button-text">Generate fundamentals</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function buildProjectStats(projects: LearningProject[]) {
  const completedProjects = projects.filter((project) => project.progress >= 100).length
  const inProgressProjects = projects.filter((project) => project.progress < 100).length

  return [
    {
      label: 'Total projects',
      value: String(projects.length),
      note: 'Active workspace portfolio',
      icon: FolderOpen,
      tone: 'neutral',
    },
    {
      label: 'In progress',
      value: String(inProgressProjects),
      note: 'Projects with completed lesson progress',
      icon: Clock3,
      tone: 'warning',
    },
    {
      label: 'Completed',
      value: String(completedProjects),
      note: 'Lesson paths finished end to end',
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      label: 'AI assisted',
      value: String(projects.length),
      note: 'Projects analyzed by the learning agent',
      icon: Bot,
      tone: 'accent',
    },
  ] as const
}

function buildLearningGroups(lessons: ProjectLesson[]): LessonGroup[] {
  const fundamentalKinds = new Set(['understanding', 'data-flow', 'architecture', 'user-action'])
  const fundamentalCards = lessons
    .filter((lesson) => fundamentalKinds.has(lesson.kind))
    .map(mapLessonToCard)
  const additionalCards = lessons
    .filter((lesson) => !fundamentalKinds.has(lesson.kind))
    .map(mapLessonToCard)

  return [
    {
      title: 'Fundamentals',
      subtitle: 'Start here to understand the basics of this codebase.',
      count: fundamentalCards.length,
      cards: fundamentalCards,
    },
    {
      title: 'More Lessons',
      subtitle: 'Additional generated lessons available for this project.',
      count: additionalCards.length,
      cards: additionalCards,
    },
  ].filter((group) => group.cards.length > 0)
}

function mapLessonToCard(lesson: ProjectLesson): LessonCard {
  return {
    eyebrow: lesson.eyebrow,
    title: lesson.title,
    description: lesson.description,
    stats: lesson.stats,
    level: lesson.level,
    duration: lesson.duration,
    files: lesson.files,
    tone: lesson.tone,
    lessonId: lesson.id,
  }
}

async function pickProjectFolderFromDirectoryHandle(): Promise<ProjectSelection | null> {
  const directoryPicker = (window as any).showDirectoryPicker
  if (typeof directoryPicker !== 'function') {
    return null
  }

  try {
    const handle = await directoryPicker()
    const payload = await buildProjectPayloadFromDirectoryHandle(handle)
    return { payload, directoryHandle: handle }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null
    }

    throw error
  }
}

async function buildProjectPayloadFromDirectoryHandle(handle: any): Promise<AnalyzeProjectPayload> {
  const files: UploadedProjectFile[] = []

  await readDirectoryEntries(handle, '', files)

  if (files.length === 0) {
    throw new Error('The selected folder does not contain readable files.')
  }

  return {
    projectName: handle.name,
    rootPath: handle.name,
    files,
  }
}

async function readDirectoryEntries(handle: any, currentPath: string, files: UploadedProjectFile[]): Promise<void> {
  for await (const entry of handle.values()) {
    const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name
    if (shouldSkipPath(entryPath)) {
      continue
    }

    if (entry.kind === 'directory') {
      await readDirectoryEntries(entry, entryPath, files)
      continue
    }

    const file = await entry.getFile()
    files.push({
      path: entryPath,
      content: await file.text(),
    })
  }
}

async function buildProjectPayloadFromFileList(fileList: FileList): Promise<AnalyzeProjectPayload> {
  const files = Array.from(fileList).filter((file) => !shouldSkipPath(file.webkitRelativePath || file.name))
  if (files.length === 0) {
    throw new Error('The selected folder does not contain readable files.')
  }

  const projectName = getProjectNameFromRelativePath(files[0]?.webkitRelativePath || files[0]?.name || 'project')

  const uploadedFiles = await Promise.all(
    files.map(async (file) => ({
      path: stripRootDirectory(file.webkitRelativePath || file.name, projectName),
      content: await file.text(),
    })),
  )

  const rootPath = getRootPathFromFileList(files)

  return {
    projectName,
    rootPath,
    files: uploadedFiles,
  }
}

function getProjectNameFromRelativePath(relativePath: string): string {
  return relativePath.split('/')[0] || 'project'
}

function stripRootDirectory(relativePath: string, projectName: string): string {
  const normalized = relativePath.replace(/\\/g, '/')
  const prefix = `${projectName}/`
  if (normalized.startsWith(prefix)) {
    return normalized.slice(prefix.length)
  }

  return normalized
}

function getRootPathFromFileList(files: File[]): string {
  const firstFile = files[0] as File & { path?: string }
  if (firstFile?.path) {
    const normalized = firstFile.path.replace(/\\/g, '/')
    const fileName = firstFile.name
    return normalized.slice(0, Math.max(0, normalized.length - fileName.length)).replace(/\/+$/, '')
  }

  return getProjectNameFromRelativePath(files[0]?.webkitRelativePath || files[0]?.name || 'project')
}

function shouldSkipPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/')
  return (
    normalized.includes('/node_modules/') ||
    normalized.startsWith('node_modules/') ||
    normalized.includes('/.git/') ||
    normalized.startsWith('.git/') ||
    normalized.includes('/dist/') ||
    normalized.startsWith('dist/') ||
    normalized.includes('/build/') ||
    normalized.startsWith('build/') ||
    normalized.includes('/.next/') ||
    normalized.startsWith('.next/')
  )
}

function formatUpdatedLabel(isoTimestamp: string): string {
  const updatedAt = new Date(isoTimestamp)
  const diffMs = Date.now() - updatedAt.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    return `Updated ${Math.max(1, Math.floor(diffMs / minute))} minutes ago`
  }

  if (diffMs < day) {
    return `Updated ${Math.max(1, Math.floor(diffMs / hour))} hours ago`
  }

  return `Updated ${Math.max(1, Math.floor(diffMs / day))} days ago`
}

async function pickProjectFolder(fileInput: HTMLInputElement | null): Promise<ProjectSelection | null> {
  const payload = await pickProjectFolderPayload(fileInput)
  return payload ? { payload, directoryHandle: null } : null
}

async function pickProjectFolderPayload(fileInput: HTMLInputElement | null): Promise<AnalyzeProjectPayload | null> {
  if (!fileInput) {
    return null
  }

  fileInput.value = ''

  return new Promise((resolve, reject) => {
    let settled = false

    const cleanup = () => {
      fileInput.removeEventListener('change', onChange)
      window.removeEventListener('focus', onFocus)
    }

    const finish = (value: AnalyzeProjectPayload | null) => {
      if (settled) {
        return
      }

      settled = true
      cleanup()
      resolve(value)
    }

    const onChange = async () => {
      try {
        const nextFiles = fileInput.files
        if (!nextFiles || nextFiles.length === 0) {
          finish(null)
          return
        }

        const payload = await buildProjectPayloadFromFileList(nextFiles)
        finish(payload)
      } catch (error) {
        if (settled) {
          return
        }

        settled = true
        cleanup()
        reject(error)
      }
    }

    const onFocus = () => {
      window.setTimeout(() => {
        if (!settled && (!fileInput.files || fileInput.files.length === 0)) {
          finish(null)
        }
      }, 0)
    }

    fileInput.addEventListener('change', onChange, { once: true })
    window.addEventListener('focus', onFocus, { once: true })
    fileInput.click()
  })
}

function registerProjectDirectoryHandle(
  project: Pick<LearningProject, 'id' | 'rootPath'>,
  directoryHandle?: FileSystemDirectoryHandleLike | null,
) {
  if (!directoryHandle) {
    return
  }

  projectDirectoryHandles.set(project.id, directoryHandle)
  projectDirectoryHandles.set(project.rootPath, directoryHandle)
}

async function readProjectLayerIndex(project: LearningProject): Promise<LayerSummary[]> {
  const directoryHandle = projectDirectoryHandles.get(project.id) ?? projectDirectoryHandles.get(project.rootPath)
  if (!directoryHandle) {
    throw new Error('Layer metadata is available for projects analyzed in this browser session via folder access.')
  }

  const permissionState = await ensureDirectoryReadPermission(directoryHandle)
  if (permissionState !== 'granted') {
    throw new Error('Read access to the project folder was not granted, so layer metadata cannot be loaded.')
  }

  try {
    const agentDirectory = await directoryHandle.getDirectoryHandle('.agent')
    const layerIndexHandle = await agentDirectory.getFileHandle('layer-index.json')
    const layerIndexFile = await layerIndexHandle.getFile()
    const layerIndexText = await layerIndexFile.text()
    return parseLayerIndex(layerIndexText)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotFoundError') {
      throw new Error('This codebase does not have `.agent/layer-index.json` yet.')
    }

    if (error instanceof SyntaxError) {
      throw new Error('The `.agent/layer-index.json` file could not be parsed.')
    }

    throw error
  }
}

async function ensureDirectoryReadPermission(handle: FileSystemDirectoryHandleLike): Promise<PermissionState> {
  if (typeof handle.queryPermission === 'function') {
    const currentPermission = await handle.queryPermission({ mode: 'read' })
    if (currentPermission === 'granted') {
      return currentPermission
    }
  }

  if (typeof handle.requestPermission === 'function') {
    return handle.requestPermission({ mode: 'read' })
  }

  return 'granted'
}

function parseLayerIndex(rawLayerIndex: string): LayerSummary[] {
  const parsed = JSON.parse(rawLayerIndex)
  const sourceLayers = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.layers)
      ? parsed.layers
      : Array.isArray(parsed?.items)
        ? parsed.items
        : typeof parsed?.layers === 'object' && parsed.layers
          ? Object.entries(parsed.layers).map(([name, value]) => ({ name, ...(value as object) }))
          : typeof parsed === 'object' && parsed
            ? Object.entries(parsed).map(([name, value]) => ({ name, ...(value as object) }))
            : []

  return sourceLayers
    .map((layer, index) => normalizeLayerEntry(layer, index))
    .filter((layer): layer is LayerSummary => layer !== null)
}

function normalizeLayerEntry(layer: unknown, index: number): LayerSummary | null {
  if (!layer || typeof layer !== 'object') {
    return null
  }

  const record = layer as Record<string, unknown>
  const layerDetails = getNestedLayerRecord(record)
  const layerFileEntries = getLayerFileEntries(record, layerDetails)
  const rawName =
    record.name ??
    record.layerName ??
    record.title ??
    record.id ??
    layerDetails.name ??
    layerDetails.layerName ??
    layerDetails.title ??
    layerDetails.id
  const name = typeof rawName === 'string' ? rawName.trim() : ''
  if (!name) {
    return null
  }

  const description = resolveLayerDescription(record, layerDetails, layerFileEntries)
  const files = collectLayerFiles(record, layerDetails, layerFileEntries)

  return {
    id: `${name}-${index}`,
    name,
    description,
    files,
  }
}

function getNestedLayerRecord(layer: Record<string, unknown>): Record<string, unknown> {
  const nestedCandidates = [layer.layer, layer.metadata, layer.data, layer.attributes, layer.info]

  for (const candidate of nestedCandidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      return candidate as Record<string, unknown>
    }
  }

  return {}
}

function getLayerFileEntries(layer: Record<string, unknown>, nestedLayer: Record<string, unknown>): Record<string, unknown>[] {
  const sources = [layer.files, nestedLayer.files]
  const entries: Record<string, unknown>[] = []

  for (const source of sources) {
    if (!Array.isArray(source)) {
      continue
    }

    for (const entry of source) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        entries.push(entry as Record<string, unknown>)
      }
    }
  }

  return entries
}

function resolveLayerDescription(
  layer: Record<string, unknown>,
  nestedLayer: Record<string, unknown>,
  fileEntries: Record<string, unknown>[],
): string {
  const candidates = [
    layer.description,
    layer.summary,
    layer.purpose,
    layer.details,
    nestedLayer.description,
    nestedLayer.summary,
    nestedLayer.purpose,
    nestedLayer.details,
    collectLayerDescription(fileEntries),
  ]

  for (const candidate of candidates) {
    const normalized = normalizeDescription(candidate)
    if (normalized.length > 0) {
      return normalized
    }
  }

  return ''
}

function collectLayerDescription(fileEntries: Record<string, unknown>[]): string {
  const descriptions = fileEntries
    .map((entry) => normalizeDescription(entry.description ?? entry.summary ?? entry.notes))
    .filter((value) => value.length > 0)

  if (descriptions.length === 0) {
    return ''
  }

  return descriptions.join('\n\n')
}

function normalizeDescription(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim()
  }

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const record = value as Record<string, unknown>
    return [record.description, record.boundaries, record.ownership, record.risks]
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
      .join('\n\n')
  }

  return ''
}

function collectLayerFiles(
  layer: Record<string, unknown>,
  nestedLayer: Record<string, unknown>,
  fileEntries: Record<string, unknown>[],
): string[] {
  const collected = new Set<string>()
  const fileSources = [
    layer.files,
    layer.filePaths,
    layer.paths,
    layer.members,
    nestedLayer.files,
    nestedLayer.filePaths,
    nestedLayer.paths,
    nestedLayer.members,
  ]
  const importSources = [layer.imports, nestedLayer.imports]

  for (const source of fileSources) {
    if (!Array.isArray(source)) {
      continue
    }

    for (const entry of source) {
      const value = stringifyLayerFile(entry)
      if (value) {
        collected.add(value)
      }
    }
  }

  for (const source of importSources) {
    if (!Array.isArray(source)) {
      continue
    }

    for (const entry of source) {
      const value = stringifyLayerFile(entry)
      if (value) {
        collected.add(value)
      }
    }
  }

  for (const entry of fileEntries) {
    const filePath = stringifyLayerFile(entry.path ?? entry.file ?? entry.name)
    if (filePath) {
      collected.add(filePath)
    }

    if (Array.isArray(entry.imports)) {
      for (const importedEntry of entry.imports) {
        const value = stringifyLayerFile(importedEntry)
        if (value) {
          collected.add(value)
        }
      }
    }
  }

  return Array.from(collected)
}

function stringifyLayerFile(entry: unknown): string | null {
  if (typeof entry === 'string') {
    return entry
  }

  if (entry && typeof entry === 'object') {
    const record = entry as Record<string, unknown>
    const candidate = record.path ?? record.file ?? record.name
    return typeof candidate === 'string' ? candidate : null
  }

  return null
}

function chunkLayers(layers: LayerSummary[], chunkSize: number): LayerSummary[][] {
  const rows: LayerSummary[][] = []

  for (let index = 0; index < layers.length; index += chunkSize) {
    rows.push(layers.slice(index, index + chunkSize))
  }

  return rows
}
