import type { CertificateRecord } from "./types.js";
import { normalizeCertificateRecord, validateRecordFields } from "./records.js";

export function parseCertificateJson(input: string): CertificateRecord[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error("JSON input is not valid JSON.");
  }

  if (!Array.isArray(parsed)) throw new Error("JSON input must be an array of certificate records.");
  if (!parsed.length) throw new Error("JSON input must contain at least one certificate record.");

  return parsed.map((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`JSON record ${index + 1} must be an object.`);
    }
    const record = value as Record<string, unknown>;
    validateRecordFields(Object.keys(record), "JSON");
    return normalizeCertificateRecord(record, `JSON record ${index + 1}`);
  });
}
