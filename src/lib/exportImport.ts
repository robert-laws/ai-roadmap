import JSZip from "jszip";
import type { AppDataExport, LessonProgress, StoredArtifact } from "../types";
import { exportData } from "./storage";

const safeFileName = (value: string) => value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");

export const downloadBackup = async (progress: LessonProgress[], artifacts: StoredArtifact[]) => {
  const zip = new JSZip();
  const exported = exportData(progress, artifacts);
  zip.file("progress.json", JSON.stringify(exported, null, 2));

  const artifactFolder = zip.folder("artifacts");
  artifacts.forEach((artifact) => {
    if (!artifact.blob) {
      return;
    }
    const name = artifact.fileName ? safeFileName(artifact.fileName) : `${artifact.id}.bin`;
    artifactFolder?.file(`${artifact.id}-${name}`, artifact.blob);
  });

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ai-roadmap-backup-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const parseBackup = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const progressFile = zip.file("progress.json");
  if (!progressFile) {
    throw new Error("Backup is missing progress.json.");
  }

  const parsed = JSON.parse(await progressFile.async("string")) as AppDataExport;
  if (parsed.version !== 1 || !Array.isArray(parsed.progress) || !Array.isArray(parsed.artifacts)) {
    throw new Error("Backup format is not supported.");
  }

  const artifacts: StoredArtifact[] = [];
  for (const artifact of parsed.artifacts) {
    let blob: Blob | undefined;
    const match = Object.values(zip.files).find((entry) => entry.name.startsWith(`artifacts/${artifact.id}-`));
    if (match && !match.dir) {
      blob = await match.async("blob");
    }
    artifacts.push({ ...artifact, blob });
  }

  return { progress: parsed.progress, artifacts };
};

export const fileToThumbnail = (file: File): Promise<string | undefined> => {
  if (!file.type.startsWith("image/")) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 420;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        resolve(undefined);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    image.src = url;
  });
};
