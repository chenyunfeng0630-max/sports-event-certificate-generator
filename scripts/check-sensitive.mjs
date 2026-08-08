#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ignoredDirectories = new Set([".git", "dist", "node_modules", "coverage"]);
const ignoredFiles = new Set(["package-lock.json"]);
const textExtensions = new Set([".ts", ".mjs", ".json", ".md", ".yml", ".yaml", ".csv", ".txt", ".svg"]);

const privateMarkers = [
  ["xzb", "kty", ".cn"].join(""),
  ["/opt/", "xzb", "kty"].join(""),
  ["member-", "certificates", ".json"].join(""),
];

const secretPatterns = [
  { name: "private key", expression: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { name: "OpenAI API key", expression: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: "GitHub token", expression: /\bgh[oprsu]_[A-Za-z0-9]{20,}\b/ },
  { name: "AWS access key", expression: /\bAKIA[A-Z0-9]{16}\b/ },
  { name: "Chinese phone number", expression: /(?<!\d)1[3-9]\d{9}(?!\d)/ },
  { name: "Chinese government ID", expression: /(?<!\d)\d{17}[\dXx](?!\d)/ },
];

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(absolutePath)));
    else if (!ignoredFiles.has(entry.name) && textExtensions.has(path.extname(entry.name))) files.push(absolutePath);
  }
  return files;
}

const findings = [];
for (const file of await listFiles(projectRoot)) {
  const content = await readFile(file, "utf8");
  const relativePath = path.relative(projectRoot, file);
  for (const marker of privateMarkers) {
    if (content.includes(marker)) findings.push(`${relativePath}: private project marker`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.expression.test(content)) findings.push(`${relativePath}: ${pattern.name}`);
  }
}

if (findings.length) {
  process.stderr.write(`Sensitive-information check failed:\n${findings.map((finding) => `- ${finding}`).join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Sensitive-information check passed.\n");
}
