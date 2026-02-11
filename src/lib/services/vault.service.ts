import path from "path";
import fs from "fs/promises";
import { getDataDir } from "@/lib/utils/paths";

// --- Types ---

export interface TreeNode {
  name: string;
  path: string; // relative to vault root
  type: "file" | "folder";
  children?: TreeNode[];
}

export interface FileMetadata {
  size: number;
  modified: string;
  created: string;
}

export interface SearchResult {
  name: string;
  path: string;
  type: "file" | "folder";
}

// --- Service ---

export const vaultService = {
  getVaultDir(): string {
    return path.join(getDataDir(), "vault");
  },

  async ensureVaultDir(): Promise<void> {
    const dir = this.getVaultDir();
    await fs.mkdir(dir, { recursive: true });
  },

  validatePath(relativePath: string): string {
    const vaultDir = this.getVaultDir();
    const resolved = path.resolve(vaultDir, relativePath);
    if (!resolved.startsWith(path.resolve(vaultDir))) {
      throw new Error("Path traversal detected");
    }
    return resolved;
  },

  async getTree(dirPath?: string): Promise<TreeNode[]> {
    await this.ensureVaultDir();
    const baseDir = dirPath
      ? this.validatePath(dirPath)
      : this.getVaultDir();

    const vaultDir = this.getVaultDir();
    const nodes: TreeNode[] = [];

    try {
      const entries = await fs.readdir(baseDir, { withFileTypes: true });

      for (const entry of entries.sort((a, b) => {
        // Folders first, then alphabetical
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      })) {
        const fullPath = path.join(baseDir, entry.name);
        const relativePath = path.relative(vaultDir, fullPath).replace(/\\/g, "/");

        if (entry.isDirectory()) {
          const children = await this.getTree(relativePath);
          nodes.push({
            name: entry.name,
            path: relativePath,
            type: "folder",
            children,
          });
        } else if (entry.name.endsWith(".md") || entry.name.endsWith(".txt")) {
          nodes.push({
            name: entry.name,
            path: relativePath,
            type: "file",
          });
        }
      }
    } catch {
      // Directory might not exist yet
    }

    return nodes;
  },

  async readFile(
    relativePath: string,
  ): Promise<{ content: string; metadata: FileMetadata }> {
    const fullPath = this.validatePath(relativePath);
    const content = await fs.readFile(fullPath, "utf-8");
    const stat = await fs.stat(fullPath);

    return {
      content,
      metadata: {
        size: stat.size,
        modified: stat.mtime.toISOString(),
        created: stat.birthtime.toISOString(),
      },
    };
  },

  async writeFile(relativePath: string, content: string): Promise<void> {
    const fullPath = this.validatePath(relativePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  },

  async createFile(relativePath: string, content: string = ""): Promise<void> {
    const fullPath = this.validatePath(relativePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    // Check if file already exists
    try {
      await fs.access(fullPath);
      throw new Error("File already exists");
    } catch (e: any) {
      if (e.message === "File already exists") throw e;
      // File doesn't exist — good, create it
    }

    await fs.writeFile(fullPath, content, "utf-8");
  },

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = this.validatePath(relativePath);
    await fs.unlink(fullPath);
  },

  async createFolder(relativePath: string): Promise<void> {
    const fullPath = this.validatePath(relativePath);
    await fs.mkdir(fullPath, { recursive: true });
  },

  async renameFile(oldPath: string, newPath: string): Promise<void> {
    const oldFull = this.validatePath(oldPath);
    const newFull = this.validatePath(newPath);
    const dir = path.dirname(newFull);
    await fs.mkdir(dir, { recursive: true });
    await fs.rename(oldFull, newFull);
  },

  async searchFiles(query: string): Promise<SearchResult[]> {
    await this.ensureVaultDir();
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    async function searchDir(dirPath: string, vaultDir: string) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(vaultDir, fullPath).replace(/\\/g, "/");

          if (entry.name.toLowerCase().includes(lowerQuery)) {
            results.push({
              name: entry.name,
              path: relativePath,
              type: entry.isDirectory() ? "folder" : "file",
            });
          }

          if (entry.isDirectory()) {
            await searchDir(fullPath, vaultDir);
          }
        }
      } catch {
        // Skip inaccessible directories
      }
    }

    await searchDir(this.getVaultDir(), this.getVaultDir());
    return results;
  },

  // --- Journal interop ---

  async syncJournalEntry(entry: {
    id: number;
    title?: string | null;
    content?: string | null;
    entryDate: string;
  }): Promise<void> {
    await this.ensureVaultDir();
    const journalDir = "journal";
    await this.createFolder(journalDir);

    const date = entry.entryDate.split(" ")[0];
    const slug = (entry.title ?? "untitled")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const filename = `${journalDir}/${date}-${slug}.md`;

    const content = entry.content ?? "";
    await this.writeFile(filename, content);
  },

  getJournalVaultPath(): string {
    return "journal";
  },
};
