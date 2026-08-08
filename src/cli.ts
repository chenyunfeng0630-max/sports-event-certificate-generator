#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCertificateCsv } from "./csv.js";
import { writeCertificates } from "./generate.js";
import type { GeneratorConfig } from "./types.js";

const help = `sports-event-certificate-generator

Usage:
  sport-cert generate --input participants.csv --config config.json --out generated [--overwrite]
  sport-cert --help
  sport-cert --version

Required CSV columns:
  recipientId, recipientName, achievement

Optional CSV columns:
  category, eventDate, verificationUrl
`;

function option(args: string[], name: string): string {
  const index = args.indexOf(name);
  const value = index === -1 ? undefined : args[index + 1];
  if (!value) throw new Error(`Missing required option: ${name}`);
  return value;
}

async function version(): Promise<string> {
  const currentFile = fileURLToPath(import.meta.url);
  const packagePath = path.resolve(path.dirname(currentFile), "../../package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as { version: string };
  return packageJson.version;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    process.stdout.write(help);
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(`${await version()}\n`);
    return;
  }
  if (args[0] !== "generate") throw new Error(`Unknown command: ${args[0]}`);

  const inputPath = path.resolve(option(args, "--input"));
  const configPath = path.resolve(option(args, "--config"));
  const outputDirectory = path.resolve(option(args, "--out"));
  const overwrite = args.includes("--overwrite");

  const [csv, configText] = await Promise.all([readFile(inputPath, "utf8"), readFile(configPath, "utf8")]);
  const records = parseCertificateCsv(csv);
  const config = JSON.parse(configText) as GeneratorConfig;
  const manifest = await writeCertificates(outputDirectory, records, config, { overwrite });

  process.stdout.write(`Generated ${manifest.certificates.length} certificate(s).\n`);
  process.stdout.write(`Output: ${outputDirectory}\n`);
  process.stdout.write("Recipient names were not written to the manifest or console.\n");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
