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

export type AgentChatPayload = {
  message: string;
  verbose?: boolean;
  workspaceRoot: string;
};

export type AgentChatResult = {
  reply: string;
  runId: string;
  summary: string | null;
};

export type PlaygroundChallengeDifficulty = "beginner" | "intermediate" | "hard";
export type PlaygroundPreferredLanguage = string;

export type PlaygroundLayerSummary = {
  description: string;
  entryPoints: string[];
  fileCount: number;
  id: string;
  importanceScore: number;
  name: string;
};

export type PlaygroundExercise = {
  concept: string;
  expectedLogic: string[];
  goal: string;
  hints: string[];
  id: string;
  task: string;
  title: string;
};

export type PlaygroundCodeFile = {
  content: string;
  language: string;
  path: string;
};

export type PlaygroundLessonStep = {
  callout: string;
  checkpoints: string[];
  difficulty: PlaygroundChallengeDifficulty;
  id: string;
  kind: "lesson";
  instructionMarkdown: string;
  objective: string;
  title: string;
  teachingMarkdown: string;
  visual: {
    bullets: string[];
    subtitle: string;
    title: string;
  };
};

export type PlaygroundChallengeStep = {
  assistantNotes: string[];
  code: {
    activeFilePath: string;
    files: PlaygroundCodeFile[];
  };
  difficulty: PlaygroundChallengeDifficulty;
  exercise: PlaygroundExercise;
  id: string;
  kind: "challenge";
  instructionMarkdown: string;
  objective: string;
  shellLines: string[];
  title: string;
  teachingMarkdown: string;
};

export type PlaygroundStep = PlaygroundLessonStep | PlaygroundChallengeStep;

export type PlaygroundSession = {
  architectureNotes: string[];
  createdAt?: string;
  concepts: string[];
  difficulty: PlaygroundChallengeDifficulty;
  id: string;
  language: PlaygroundPreferredLanguage;
  layerName: string;
  projectName?: string;
  prompt: string;
  sandbox: {
    executeLabel: string;
    futureHook: string;
    status: "planned";
    supported: false;
    validationLabel: string;
  };
  selectedFiles: string[];
  source: "layer-index" | "chat-intent";
  steps: PlaygroundStep[];
  title: string;
  workspaceRoot?: string;
};

export type PlaygroundBootstrap = {
  defaultDifficulty: PlaygroundChallengeDifficulty;
  defaultLanguage: PlaygroundPreferredLanguage;
  layers: PlaygroundLayerSummary[];
  projectName: string;
  suggestedPrompts: string[];
  workspaceRoot: string;
};

export type PlaygroundSessionPayload = {
  difficulty?: PlaygroundChallengeDifficulty;
  language?: PlaygroundPreferredLanguage;
  layerName?: string;
  prompt?: string;
  workspaceRoot?: string;
};

export type PlaygroundSessionResult = {
  session: PlaygroundSession;
  sessionId: string;
};

export type PlaygroundSessionCard = {
  createdAt: string;
  difficulty: PlaygroundChallengeDifficulty;
  id: string;
  language: PlaygroundPreferredLanguage;
  layerName: string;
  projectName: string;
  prompt: string;
  source: "layer-index" | "chat-intent";
  stepCount: number;
  title: string;
};
