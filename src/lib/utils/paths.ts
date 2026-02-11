import path from "path";
import fs from "fs";
import os from "os";

export function getDataDir(): string {
  // Check for portable mode: if monolith.db exists in project root
  const projectRoot = process.cwd();
  const portableDbPath = path.join(projectRoot, "monolith.db");

  if (fs.existsSync(portableDbPath)) {
    return projectRoot;
  }

  // OS-specific default paths
  let dataDir = "";
  switch (process.platform) {
    case "win32":
      dataDir = path.join(process.env.APPDATA || os.homedir(), "Monolith");
      break;
    case "darwin":
      dataDir = path.join(
        os.homedir(),
        "Library",
        "Application Support",
        "Monolith",
      );
      break;
    default: // linux and others
      dataDir = path.join(os.homedir(), ".config", "monolith");
      break;
  }

  // Ensure directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return dataDir;
}

export function getDbPath(): string {
  return path.join(getDataDir(), "monolith.db");
}
