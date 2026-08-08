#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const cacheDirectory = path.join(tmpdir(), "sports-event-certificate-generator-npm-cache");
const result = spawnSync(npmCommand, ["pack", "--dry-run"], {
  stdio: "inherit",
  env: {
    ...process.env,
    npm_config_cache: cacheDirectory,
  },
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
