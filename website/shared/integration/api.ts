import type { AnalyzeProjectPayload, LearningProject, ProjectLesson } from "./types";

const DEFAULT_AGENT_API_URL = "http://localhost:4315";

function getAgentApiBaseUrl(): string {
  const configuredUrl = import.meta.env?.VITE_AGENT_API_URL;
  return (configuredUrl || DEFAULT_AGENT_API_URL).replace(/\/+$/, "");
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getAgentApiBaseUrl()}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload as T;
}

export async function fetchProjects(): Promise<LearningProject[]> {
  const payload = await requestJson<{ projects: LearningProject[] }>("/api/projects");
  return payload.projects;
}

export async function analyzeProject(payload: AnalyzeProjectPayload): Promise<LearningProject> {
  const response = await requestJson<{ project: LearningProject }>("/api/projects/analyze", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.project;
}

export async function fetchProject(projectId: string): Promise<LearningProject> {
  const payload = await requestJson<{ project: LearningProject }>(`/api/projects/${encodeURIComponent(projectId)}`);
  return payload.project;
}

export async function fetchLesson(
  projectId: string,
  lessonId: string
): Promise<{ project: Pick<LearningProject, "id" | "name">; lesson: ProjectLesson }> {
  return requestJson<{ project: Pick<LearningProject, "id" | "name">; lesson: ProjectLesson }>(
    `/api/projects/${encodeURIComponent(projectId)}/lessons/${encodeURIComponent(lessonId)}`
  );
}

export function getEditorAppUrl(projectId: string, lessonId: string): string {
  const configuredUrl = import.meta.env?.VITE_EDITOR_URL;
  const fallbackUrl =
    typeof window !== "undefined" && window.location.hostname === "localhost"
      ? `${window.location.protocol}//${window.location.hostname}:5174/`
      : "/editor/";
  const baseUrl = (configuredUrl || fallbackUrl).replace(/\/+$/, "");
  return `${baseUrl}/?projectId=${encodeURIComponent(projectId)}&lessonId=${encodeURIComponent(lessonId)}`;
}
