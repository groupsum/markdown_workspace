import path from 'node:path';

export interface DesktopAccessPolicy {
  registerProjectRoot(rootPath: string): void;
  registerFilePath(filePath: string): void;
  isPathAllowed(candidatePath: string): boolean;
  assertAllowed(candidatePath: string, operation: string): string;
}

function normalizePath(candidatePath: string): string {
  return path.resolve(candidatePath);
}

function isPathInside(rootPath: string, candidatePath: string): boolean {
  const relative = path.relative(rootPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function createDesktopAccessPolicy(): DesktopAccessPolicy {
  const projectRoots = new Set<string>();
  const filePaths = new Set<string>();

  return {
    registerProjectRoot(rootPath: string): void {
      projectRoots.add(normalizePath(rootPath));
    },
    registerFilePath(filePath: string): void {
      filePaths.add(normalizePath(filePath));
    },
    isPathAllowed(candidatePath: string): boolean {
      const normalizedCandidate = normalizePath(candidatePath);
      if (filePaths.has(normalizedCandidate)) {
        return true;
      }
      for (const rootPath of projectRoots) {
        if (isPathInside(rootPath, normalizedCandidate)) {
          return true;
        }
      }
      return false;
    },
    assertAllowed(candidatePath: string, operation: string): string {
      const normalizedCandidate = normalizePath(candidatePath);
      if (!this.isPathAllowed(normalizedCandidate)) {
        throw new Error(`Desktop filesystem permission denied for ${operation}: ${normalizedCandidate}`);
      }
      return normalizedCandidate;
    },
  };
}
