/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/explicit-function-return-type */
const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const cacheFile = path.join(
  repoRoot,
  "node_modules",
  ".cache",
  "monolith",
  "electron-native-deps.json",
);
const betterSqlite3Binary = path.join(
  repoRoot,
  "node_modules",
  "better-sqlite3",
  "build",
  "Release",
  "better_sqlite3.node",
);

function getPackageVersion(packageName) {
  return require(
    path.join(repoRoot, "node_modules", packageName, "package.json"),
  ).version;
}

function getBinaryHash() {
  if (!fs.existsSync(betterSqlite3Binary)) {
    return null;
  }

  const binaryBuffer = fs.readFileSync(betterSqlite3Binary);
  return createHash("sha256").update(binaryBuffer).digest("hex");
}

function readCache() {
  if (!fs.existsSync(cacheFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(cacheFile, "utf8"));
  } catch {
    return null;
  }
}

function writeCache(state) {
  fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
  fs.writeFileSync(cacheFile, JSON.stringify(state, null, 2));
}

function getExpectedState() {
  return {
    electronVersion: getPackageVersion("electron"),
    betterSqlite3Version: getPackageVersion("better-sqlite3"),
    platform: process.platform,
    arch: process.arch,
    binaryHash: getBinaryHash(),
  };
}

function rebuildNativeDeps() {
  const rebuildEnv = { ...process.env };
  delete rebuildEnv.ELECTRON_RUN_AS_NODE;

  const electronVersion = getPackageVersion("electron");
  console.log(`Rebuilding better-sqlite3 for Electron ${electronVersion}...`);

  const result = spawnSync(
    npmCommand,
    [
      "rebuild",
      "better-sqlite3",
      "--runtime=electron",
      `--target=${electronVersion}`,
      "--dist-url=https://electronjs.org/headers",
    ],
    {
      cwd: repoRoot,
      env: rebuildEnv,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `better-sqlite3 rebuild failed with exit code ${result.status ?? "unknown"}`,
    );
  }
}

function isCacheValid(cache, expectedState) {
  if (!cache || !expectedState.binaryHash) {
    return false;
  }

  return (
    cache.electronVersion === expectedState.electronVersion &&
    cache.betterSqlite3Version === expectedState.betterSqlite3Version &&
    cache.platform === expectedState.platform &&
    cache.arch === expectedState.arch &&
    cache.binaryHash === expectedState.binaryHash
  );
}

function ensureElectronNativeDeps() {
  const expectedState = getExpectedState();
  const cache = readCache();

  if (isCacheValid(cache, expectedState)) {
    return;
  }

  rebuildNativeDeps();

  const rebuiltState = getExpectedState();
  if (!rebuiltState.binaryHash) {
    throw new Error(
      `better-sqlite3 binary was not found after rebuild at ${betterSqlite3Binary}`,
    );
  }

  writeCache(rebuiltState);
}

if (require.main === module) {
  try {
    ensureElectronNativeDeps();
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

module.exports = {
  ensureElectronNativeDeps,
};
