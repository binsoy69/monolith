/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("node:child_process");
const path = require("node:path");
const {
  ensureElectronNativeDeps,
} = require("./ensure-electron-native-deps.cjs");

const electronViteCli = path.join(
  __dirname,
  "..",
  "node_modules",
  "electron-vite",
  "bin",
  "electron-vite.js",
);

const command = process.argv[2];
if (command === "dev" || command === "preview") {
  try {
    ensureElectronNativeDeps();
  } catch (error) {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exit(1);
  }
}

const childEnv = { ...process.env };
delete childEnv.ELECTRON_RUN_AS_NODE;

const child = spawn(
  process.execPath,
  [electronViteCli, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: childEnv,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
