import { createHash } from "node:crypto";
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveConfig } from "./config.js";
import { generateCertificates } from "./generate.js";
import type { CertificateRecord, GeneratorConfig, InputFormat, UsageReport } from "./types.js";

function eventFingerprint(config: GeneratorConfig): string {
  const resolved = resolveConfig(config);
  return createHash("sha256")
    .update(`${resolved.namespace}\u0000${resolved.eventName}`, "utf8")
    .digest("hex")
    .slice(0, 16);
}

export function createUsageReport(
  records: CertificateRecord[],
  config: GeneratorConfig,
  options: {
    toolVersion: string;
    inputFormat: InputFormat;
    mode: "validate" | "generate";
    outputWritten: boolean;
    now?: Date;
  },
): UsageReport {
  const certificates = generateCertificates(records, config);
  return {
    schemaVersion: 1,
    toolVersion: options.toolVersion,
    createdAt: (options.now ?? new Date()).toISOString(),
    mode: options.mode,
    inputFormat: options.inputFormat,
    eventFingerprint: eventFingerprint(config),
    recordCount: records.length,
    certificateCount: certificates.length,
    categoryCount: new Set(records.map((record) => record.category).filter(Boolean)).size,
    verificationLinkCount: records.filter((record) => Boolean(record.verificationUrl)).length,
    outputWritten: options.outputWritten,
    privacy: {
      containsRecipientNames: false,
      containsRecipientIds: false,
      containsEventName: false,
    },
  };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeUsageReport(
  reportPath: string,
  report: UsageReport,
  options: { overwrite?: boolean } = {},
): Promise<void> {
  if (!options.overwrite && (await exists(reportPath))) {
    throw new Error(`Refusing to overwrite existing file: ${reportPath}`);
  }
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}
