#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCertificateCsv } from "./csv.js";
import { writeCertificates } from "./generate.js";
import { parseCertificateJson } from "./json.js";
import { createUsageReport, writeUsageReport } from "./report.js";
import type { CertificateRecord, GeneratorConfig, InputFormat, UsageReport } from "./types.js";

const help = `sports-event-certificate-generator

Usage:
  sport-cert validate --input participants.csv --config config.json [--format csv|json] [--report report.json] [--overwrite]
  sport-cert generate --input participants.csv --config config.json --out generated [--format csv|json] [--report report.json] [--overwrite]
  sport-cert generate --input participants.json --config config.json --dry-run [--report report.json] [--overwrite]
  sport-cert --help
  sport-cert --version

CSV and JSON record fields:
  Required: recipientId, recipientName, achievement
  Optional: category, eventDate, verificationUrl

Validation and dry-run reports contain aggregate counts and an event fingerprint,
but never recipient names, recipient IDs, or the event name.
`;

function option(args: string[], name: string, required = true): string | undefined {
  const index = args.indexOf(name);
  const value = index === -1 ? undefined : args[index + 1];
  if (required && !value) throw new Error(`Missing required option: ${name}`);
  return value;
}

async function version(): Promise<string> {
  const currentFile = fileURLToPath(import.meta.url);
  const packagePath = path.resolve(path.dirname(currentFile), "../../package.json");
  const packageJson = JSON.parse(await readFile(packagePath, "utf8")) as { version: string };
  return packageJson.version;
}

function inputFormat(inputPath: string, requested?: string): InputFormat {
  const candidate = requested ?? path.extname(inputPath).slice(1).toLowerCase();
  if (candidate !== "csv" && candidate !== "json") {
    throw new Error("Input format must be csv or json. Use --format when the file extension is ambiguous.");
  }
  return candidate;
}

function parseRecords(text: string, format: InputFormat): CertificateRecord[] {
  return format === "json" ? parseCertificateJson(text) : parseCertificateCsv(text);
}

function reportSummary(report: UsageReport): void {
  process.stdout.write(
    `${report.mode === "generate" ? "Generated" : "Validated"} ${report.certificateCount} certificate record(s).\n`,
  );
  process.stdout.write(`Event fingerprint: ${report.eventFingerprint}\n`);
  process.stdout.write("The usage report and console output contain no recipient names or recipient IDs.\n");
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

  const command = args[0];
  if (command !== "generate" && command !== "validate") throw new Error(`Unknown command: ${command}`);

  const inputPath = path.resolve(option(args, "--input")!);
  const configPath = path.resolve(option(args, "--config")!);
  const reportOption = option(args, "--report", false);
  const reportPath = reportOption ? path.resolve(reportOption) : undefined;
  const overwrite = args.includes("--overwrite");
  const dryRun = command === "validate" || args.includes("--dry-run");
  const format = inputFormat(inputPath, option(args, "--format", false));
  const currentVersion = await version();

  const [inputText, configText] = await Promise.all([readFile(inputPath, "utf8"), readFile(configPath, "utf8")]);
  const records = parseRecords(inputText, format);
  const config = JSON.parse(configText) as GeneratorConfig;

  if (dryRun) {
    const report = createUsageReport(records, config, {
      toolVersion: currentVersion,
      inputFormat: format,
      mode: "validate",
      outputWritten: false,
    });
    if (reportPath) await writeUsageReport(reportPath, report, { overwrite });
    reportSummary(report);
    if (reportPath) process.stdout.write(`Privacy-safe report: ${reportPath}\n`);
    process.stdout.write("No certificate files were written.\n");
    return;
  }

  const outputDirectory = path.resolve(option(args, "--out")!);
  const manifest = await writeCertificates(outputDirectory, records, config, { overwrite });
  const report = createUsageReport(records, config, {
    toolVersion: currentVersion,
    inputFormat: format,
    mode: "generate",
    outputWritten: true,
  });
  if (reportPath) await writeUsageReport(reportPath, report, { overwrite });

  reportSummary(report);
  process.stdout.write(`Output: ${outputDirectory}\n`);
  if (reportPath) process.stdout.write(`Privacy-safe report: ${reportPath}\n`);
  process.stdout.write(`Name-free manifest entries: ${manifest.certificates.length}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
