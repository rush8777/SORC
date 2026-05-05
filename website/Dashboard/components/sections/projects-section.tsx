'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
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
import { analyzeProject, fetchProjects } from '@shared/integration/api'
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
      const createdProject = await analyzeProject(selection)
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
            <a href="#" className="dashboard-inline-link">
              Tell me more
              <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="dashboard-project-detail__topics">
            <h3>Related topics</h3>
            <div className="dashboard-project-detail__topics-grid" role="list" aria-label="Related topics">
              {project.technologies.map((technology) => (
                <a key={technology} href="#" className="dashboard-project-detail__topic" role="listitem">
                  {technology}
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

            <div className={`dashboard-grid ${group.cards.length === 4 ? 'dashboard-grid--project-lessons-four' : 'dashboard-grid--project-lessons-three'}`}>
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
  const fundamentalCards = lessons
    .filter((lesson) => lesson.kind === 'understanding' || lesson.kind === 'data-flow')
    .map(mapLessonToCard)
  const additionalCards = lessons
    .filter((lesson) => lesson.kind !== 'understanding' && lesson.kind !== 'data-flow')
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

async function pickProjectFolder(fileInput: HTMLInputElement | null): Promise<AnalyzeProjectPayload | null> {
  if (!fileInput) {
    throw new Error('Folder picking is not supported in this browser.')
  }

  return new Promise<AnalyzeProjectPayload | null>((resolve, reject) => {
    const cleanup = () => {
      fileInput.removeEventListener('change', onChange)
      window.removeEventListener('focus', onFocus)
    }

    const onChange = async () => {
      cleanup()

      try {
        const files = fileInput.files
        fileInput.value = ''
        if (!files?.length) {
          resolve(null)
          return
        }

        const payload = await buildProjectPayloadFromFileList(files)
        resolve(payload)
      } catch (error) {
        reject(error)
      }
    }

    const onFocus = () => {
      window.setTimeout(() => {
        if (fileInput.files?.length) {
          return
        }

        cleanup()
        resolve(null)
      }, 0)
    }

    fileInput.addEventListener('change', onChange, { once: true })
    window.addEventListener('focus', onFocus, { once: true })
    fileInput.click()
  })
}

async function pickProjectFolderFromDirectoryHandle(): Promise<AnalyzeProjectPayload | null> {
  const directoryPicker = (window as any).showDirectoryPicker
  if (typeof directoryPicker !== 'function') {
    return null
  }

  try {
    const handle = await directoryPicker()
    return buildProjectPayloadFromDirectoryHandle(handle)
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
