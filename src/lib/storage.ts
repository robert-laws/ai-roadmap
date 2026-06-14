import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AppDataExport, ExampleArtifact, LessonProgress, StoredArtifact } from "../types";

interface RoadmapDb extends DBSchema {
  progress: {
    key: string;
    value: LessonProgress;
  };
  artifacts: {
    key: string;
    value: StoredArtifact;
    indexes: { "by-lesson": string; "by-track": string; "by-created": string };
  };
}

const DB_NAME = "ai-roadmap-studio";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RoadmapDb>> | undefined;

const db = () => {
  if (!dbPromise) {
    dbPromise = openDB<RoadmapDb>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains("progress")) {
          database.createObjectStore("progress", { keyPath: "lessonId" });
        }
        if (!database.objectStoreNames.contains("artifacts")) {
          const store = database.createObjectStore("artifacts", { keyPath: "id" });
          store.createIndex("by-lesson", "lessonId");
          store.createIndex("by-track", "trackId");
          store.createIndex("by-created", "createdAt");
        }
      }
    });
  }
  return dbPromise;
};

export const loadProgress = async () => {
  const database = await db();
  return database.getAll("progress");
};

export const saveProgress = async (progress: LessonProgress) => {
  const database = await db();
  await database.put("progress", progress);
};

export const loadArtifacts = async () => {
  const database = await db();
  return database.getAll("artifacts");
};

export const saveArtifact = async (artifact: StoredArtifact) => {
  const database = await db();
  await database.put("artifacts", artifact);
};

export const deleteArtifact = async (id: string) => {
  const database = await db();
  await database.delete("artifacts", id);
};

export const clearAllData = async () => {
  const database = await db();
  await database.clear("progress");
  await database.clear("artifacts");
};

export const exportData = (progress: LessonProgress[], artifacts: StoredArtifact[]): AppDataExport => ({
  version: 1,
  exportedAt: new Date().toISOString(),
  progress,
  artifacts: artifacts.map(({ blob, ...metadata }) => metadata)
});

export const artifactMetadata = (artifact: StoredArtifact): ExampleArtifact => {
  const { blob, ...metadata } = artifact;
  return metadata;
};
