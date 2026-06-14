import type { LucideIcon } from "lucide-react";

export type TrackId = "A" | "B" | "C" | "D" | "E" | "F";

export type LessonStatus = "not-started" | "in-progress" | "complete";

export type ArtifactType = "image" | "video" | "audio" | "document" | "link" | "text" | "other";

export interface Lesson {
  id: string;
  trackId: TrackId;
  pathLabel?: string;
  title: string;
  duration: string;
  objective: string;
  prerequisites: string[];
  tools: string[];
  goalNumbers: number[];
  steps: string[];
  checkpoint: string;
  proofArtifact: string;
  prompts?: string[];
  relatedLessonIds: string[];
}

export interface Track {
  id: TrackId;
  title: string;
  shortTitle: string;
  status: string;
  duration: string;
  accent: string;
  cover: string;
  icon: LucideIcon;
  dependencies: TrackId[];
  socialPayoff: string;
  proofOfSkill: string;
  overview: string;
  whyItMatters: string;
  lessons: Lesson[];
}

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  completedSteps: string[];
  notes: string;
  reflection: string;
  confidence: number;
  currentFocus: boolean;
  updatedAt: string;
}

export interface ExampleArtifact {
  id: string;
  lessonId: string;
  trackId: TrackId;
  title: string;
  caption: string;
  toolUsed: string;
  tags: string[];
  type: ArtifactType;
  fileName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  text?: string;
  thumbnail?: string;
  createdAt: string;
}

export interface StoredArtifact extends ExampleArtifact {
  blob?: Blob;
}

export interface AppDataExport {
  version: 1;
  exportedAt: string;
  progress: LessonProgress[];
  artifacts: ExampleArtifact[];
}
