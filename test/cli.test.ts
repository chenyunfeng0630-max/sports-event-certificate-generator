import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

async function exists(target: string): Promise<boolean> {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

test("CLI validates JSON and writes only a privacy-safe report", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sport-cert-cli-"));
  const inputPath = path.join(directory, "participants.json");
  const configPath = path.join(directory, "config.json");
  const reportPath = path.join(directory, "report.json");
  const outputPath = path.join(directory, "must-not-exist");
  await writeFile(
    inputPath,
    JSON.stringify([{ recipientId: "athlete-e2e", recipientName: "Private CLI Name", achievement: "Completion" }]),
  );
  await writeFile(configPath, JSON.stringify({ eventName: "Private CLI Event", issuer: "Private CLI Issuer" }));

  const result = await execFile(process.execPath, [
    path.resolve("dist/src/cli.js"),
    "generate",
    "--input",
    inputPath,
    "--config",
    configPath,
    "--out",
    outputPath,
    "--dry-run",
    "--report",
    reportPath,
  ]);
  const reportText = await readFile(reportPath, "utf8");

  assert.match(result.stdout, /Validated 1 certificate record/);
  assert.match(result.stdout, /No certificate files were written/);
  assert.equal(await exists(outputPath), false);
  assert.doesNotMatch(`${result.stdout}\n${reportText}`, /Private CLI Name|athlete-e2e|Private CLI Event|Private CLI Issuer/);
});
