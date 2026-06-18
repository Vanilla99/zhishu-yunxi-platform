import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const node = process.execPath;
const shim = resolve("scripts/build-permission-shims.cjs");
const tsc = resolve("node_modules/typescript/bin/tsc");
const vite = resolve("node_modules/vite/bin/vite.js");

function run(label, command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    env: {
      ...process.env,
      OPENSSL_CONF: process.env.OPENSSL_CONF ?? "/dev/null",
      ...extraEnv,
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

if (!existsSync(tsc) || !existsSync(vite)) {
  throw new Error("Missing local dependencies. Run npm install before building.");
}

run("TypeScript", node, [tsc, "-b"]);
run("Vite", node, [vite, "build"], {
  NODE_OPTIONS: [process.env.NODE_OPTIONS, `--require ${shim}`].filter(Boolean).join(" "),
});
