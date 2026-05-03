'use client'

import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  EllipsisVertical,
  FileText,
  Filter,
  FolderOpen,
  ListFilter,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectDetail = {
  title: string
  description: string
  visibility: string
  progress: number
  technologies: string[]
  updated: string
  files: string
  contributors: string
}

type LessonCard = {
  eyebrow: string
  title: string
  description: string
  stats: string
  level: string
  duration: string
  files: string
  tone: 'green' | 'blue' | 'amber' | 'violet'
}

type LessonGroup = {
  title: string
  subtitle: string
  count: number
  cards: LessonCard[]
}

const projectStats = [
  {
    label: 'Total projects',
    value: '6',
    note: 'Active workspace portfolio',
    icon: FolderOpen,
    tone: 'neutral',
  },
  {
    label: 'In progress',
    value: '3',
    note: 'Shipping this week',
    icon: Clock3,
    tone: 'warning',
  },
  {
    label: 'Completed',
    value: '2',
    note: 'Ready to showcase',
    icon: CheckCircle2,
    tone: 'success',
  },
  {
    label: 'AI assisted',
    value: '4',
    note: 'Built with copilots and reviews',
    icon: Bot,
    tone: 'accent',
  },
] as const

const projectTabs = ['All projects', 'In progress', 'Completed', 'Drafts'] as const

const featuredProject: ProjectDetail = {
  title: 'SaaS Boilerplate',
  description:
    'A full-stack Next.js SaaS starter kit with authentication, payments, team management, and analytics.',
  visibility: 'Private',
  progress: 38,
  technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
  updated: 'Updated 2 days ago',
  files: '428 files',
  contributors: '24 contributors',
}

const projects = [
  {
    title: 'AI Code Explainer',
    description: 'Turns confusing implementation details into plain-language guidance, examples, and onboarding notes for the team.',
    tag: 'Python',
    status: 'In progress',
    progress: 65,
    updated: 'Updated 2 hours ago',
    action: 'Continue',
    tone: 'accent',
  },
  {
    title: 'Codebase Q&A Assistant',
    description: 'Answers repo questions with grounded references, architecture notes, and quick links for faster contributor ramp-up.',
    tag: 'TypeScript',
    status: 'In progress',
    progress: 40,
    updated: 'Updated yesterday',
    action: 'Continue',
    tone: 'blue',
  },
  {
    title: 'API Documentation Generator',
    description: 'Generates polished API summaries, endpoint notes, and teammate-friendly implementation examples from source files.',
    tag: 'JavaScript',
    status: 'Completed',
    progress: 100,
    updated: 'Completed 3 days ago',
    action: 'View project',
    tone: 'success',
  },
  {
    title: 'Frontend Component Builder',
    description: 'Builds reusable UI pieces with preview-ready states, design notes, and implementation handoff details.',
    tag: 'HTML & CSS',
    status: 'In progress',
    progress: 25,
    updated: 'Updated 5 hours ago',
    action: 'Continue',
    tone: 'violet',
  },
] as const

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

const learningGroups: LessonGroup[] = [
  {
    title: 'Fundamentals',
    subtitle: 'Start here to understand the basics of this codebase.',
    count: 6,
    cards: [
      {
        eyebrow: 'Fundamentals',
        title: 'Understand Project Structure',
        description: 'Get a high-level overview of the folder structure and what each part of the project does.',
        stats: 'Project lesson',
        level: 'Beginner Friendly',
        duration: '8 min',
        files: '12 files',
        tone: 'green',
      },
      {
        eyebrow: 'Fundamentals',
        title: 'How the App Starts',
        description: 'Learn what happens when the application starts and how requests are handled.',
        stats: 'Project lesson',
        level: 'Beginner Friendly',
        duration: '7 min',
        files: '6 files',
        tone: 'green',
      },
      {
        eyebrow: 'Fundamentals',
        title: 'Main Technologies Used',
        description: 'Explore the core technologies, libraries, and tools that power this project.',
        stats: 'Project lesson',
        level: 'Beginner Friendly',
        duration: '6 min',
        files: '5 files',
        tone: 'green',
      },
    ],
  },
  {
    title: 'Layers of the Codebase',
    subtitle: 'Learn the architecture layer by layer.',
    count: 8,
    cards: [
      {
        eyebrow: 'Frontend Layer',
        title: 'Components Architecture',
        description: 'Understand how UI components are structured, reused, and organized.',
        stats: 'Architecture lesson',
        level: 'Intermediate',
        duration: '10 min',
        files: '16 files',
        tone: 'blue',
      },
      {
        eyebrow: 'Backend Layer',
        title: 'API Routes Design',
        description: 'See how API routes are structured and how requests flow through the system.',
        stats: 'Architecture lesson',
        level: 'Intermediate',
        duration: '12 min',
        files: '14 files',
        tone: 'blue',
      },
      {
        eyebrow: 'Data Layer',
        title: 'Database Schema',
        description: 'Explore database tables, relationships, and how data is organized.',
        stats: 'Architecture lesson',
        level: 'Beginner Friendly',
        duration: '9 min',
        files: '7 files',
        tone: 'blue',
      },
      {
        eyebrow: 'Infra Layer',
        title: 'Environment & Config',
        description: 'Understand environment variables, config files, and deployment setup.',
        stats: 'Architecture lesson',
        level: 'Beginner Friendly',
        duration: '6 min',
        files: '7 files',
        tone: 'blue',
      },
    ],
  },
]

type ProjectsSectionProps = {
  onOpenProject: () => void
  onBackToProjects?: () => void
  showDetail?: boolean
}

export default function ProjectsSection({
  onOpenProject,
  onBackToProjects,
  showDetail = false,
}: ProjectsSectionProps) {
  if (showDetail) {
    return <ProjectLearningDetail onBackToProjects={onBackToProjects ?? (() => {})} />
  }

  return (
    <section className="dashboard-section dashboard-projects">
      <div className="dashboard-section__header dashboard-projects__hero">
        <div>
          <p className="dashboard-card__eyebrow">Projects workspace</p>
          <h2 className="dashboard-section__title">Build and track your strongest work</h2>
          <p className="dashboard-projects__intro">
            Keep active builds moving, monitor momentum, and turn finished work into portfolio-ready proof.
          </p>
        </div>

        <Button className="dashboard-projects__hero-action">
          <Sparkles size={16} />
          New project
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
            {projects.map((project) => (
              <article key={project.title} className="dashboard-project-item">
                <div className="dashboard-project-item__identity">
                  <div className={`dashboard-project-item__badge dashboard-project-item__badge--${project.tone}`}>
                    <Code2 size={18} />
                  </div>

                  <div className="dashboard-project-item__content">
                    <div className="dashboard-project-item__title-row">
                      <h3 className="dashboard-project-item__title">{project.title}</h3>
                      <span className={`dashboard-project-item__status dashboard-project-item__status--${project.status.toLowerCase().replace(' ', '-')}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="dashboard-project-item__description">{project.description}</p>

                    <div className="dashboard-project-item__meta">
                      <span className="dashboard-project-item__pill">{project.tag}</span>
                      <span>{project.updated}</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-project-item__aside">
                  <button type="button" className="dashboard-project-item__menu" aria-label={`More options for ${project.title}`}>
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

                  <Button
                    className={project.progress === 100 ? 'dashboard-project-item__action dashboard-project-item__action--secondary' : 'dashboard-project-item__action'}
                    onClick={onOpenProject}
                  >
                    {project.action}
                  </Button>
                </div>
              </article>
            ))}
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
  onBackToProjects,
}: {
  onBackToProjects: () => void
}) {
  return (
    <section className="dashboard-section dashboard-project-detail">
      <button type="button" className="dashboard-project-detail__back" onClick={onBackToProjects}>
        <ArrowLeft size={16} />
        Back to projects
      </button>

      <div className="dashboard-card dashboard-project-detail__hero">
        <div className="dashboard-card__body dashboard-project-detail__hero-body">
          <div className="dashboard-project-detail__hero-main">
            <div className="dashboard-project-detail__hero-badge">
              <Code2 size={26} />
            </div>

            <div className="dashboard-project-detail__hero-copy">
              <div className="dashboard-project-detail__hero-title-row">
                <h2 className="dashboard-section__title dashboard-project-detail__title">
                  {featuredProject.title}
                </h2>
                <span className="dashboard-project-detail__privacy">{featuredProject.visibility}</span>
              </div>

              <p className="dashboard-project-detail__description">{featuredProject.description}</p>

              <div className="dashboard-project-detail__techs">
                {featuredProject.technologies.map((technology) => (
                  <span key={technology} className="dashboard-project-detail__tech">
                    {technology}
                  </span>
                ))}
              </div>

              <div className="dashboard-project-detail__meta">
                <span>{featuredProject.updated}</span>
                <span>{featuredProject.files}</span>
                <span>{featuredProject.contributors}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-project-detail__progress-panel">
            <div className="dashboard-project-detail__progress-header">
              <span>Your progress</span>
              <strong>{featuredProject.progress}%</strong>
            </div>
            <div className="dashboard-project-detail__progress-bar" aria-hidden="true">
              <span style={{ width: `${featuredProject.progress}%` }} />
            </div>
            <Button className="dashboard-project-detail__primary">
              Continue learning
            </Button>
            <Button className="dashboard-project-detail__secondary" variant="secondary">
              <Settings size={16} />
              Project settings
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-project-detail__toolbar">
        <label className="dashboard-project-detail__search" aria-label="Search lessons in this project">
          <Search size={16} />
          <input type="text" placeholder="Search lessons in this project" />
        </label>

        <div className="dashboard-project-detail__toolbar-actions">
          <button type="button" className="dashboard-project-detail__filter">
            All categories
            <ChevronDown size={16} />
          </button>
          <button type="button" className="dashboard-project-detail__filter">
            Sort: Most relevant
            <ChevronDown size={16} />
          </button>
          <button type="button" className="dashboard-project-detail__icon-button" aria-label="Grid view">
            <Filter size={16} />
          </button>
          <button type="button" className="dashboard-project-detail__icon-button" aria-label="List view">
            <ListFilter size={16} />
          </button>
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
                  key={`${group.title}-${card.title}`}
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

                  <Button className="dashboard-recommendation__action" variant="ghost">
                    Open lesson
                  </Button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="dashboard-card dashboard-project-detail__path-card">
        <div className="dashboard-card__body dashboard-project-detail__path-body">
          <div className="dashboard-project-detail__path-copy">
            <div className="dashboard-project-detail__path-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="dashboard-project-detail__path-title">AI generated learning path</h3>
              <p className="dashboard-card__muted">
                Not sure where to start? Let AI recommend the best path for your next session.
              </p>
            </div>
          </div>

          <Button className="dashboard-project-detail__path-action" variant="secondary">
            Generate my path
          </Button>
        </div>
      </div>
    </section>
  )
}
