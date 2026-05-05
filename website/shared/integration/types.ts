export type LessonCodeSnippet = {
  id: string;
  title?: string;
  filePath: string;
  language: string;
  code: string;
  startLine?: number;
  endLine?: number;
  highlightedLines?: number[];
  highlightedSymbol?: string;
  description?: string;
};

export type LessonStep = {
  id: string;
  number: number;
  title: string;
  completed: boolean;
  estimatedTime: string;
  objective: string;
  codeSnippets: LessonCodeSnippet[];
  markdown?: string;
};

export type LessonContent = {
  id: string;
  title: string;
  currentStepIndex: number;
  completionPercentage: number;
  learningObjectives: string[];
  codeFiles: Array<{
    name: string;
    path: string;
  }>;
  steps: LessonStep[];
};

export type ProjectLesson = {
  id: string;
  kind: string;
  eyebrow: string;
  title: string;
  description: string;
  stats: string;
  level: string;
  duration: string;
  files: string;
  tone: "green" | "blue" | "amber" | "violet";
  lesson: LessonContent;
};

export type LearningProject = {
  id: string;
  name: string;
  rootPath: string;
  createdAt: string;
  updatedAt: string;
  framework: string;
  architecture: string;
  status: "ready";
  progress: number;
  description: string;
  visibility: string;
  files: string;
  contributors: string;
  technologies: string[];
  lessons: ProjectLesson[];
};

export type UploadedProjectFile = {
  path: string;
  content: string;
};

export type AnalyzeProjectPayload = {
  projectName: string;
  rootPath?: string;
  files?: UploadedProjectFile[];
};
