import type { CertificateRecord } from "./types.js";
import { assertSafeOpaqueId, cleanText, validateUrl } from "./utils.js";

export const allowedRecordFields = new Set([
  "recipientId",
  "recipientName",
  "achievement",
  "category",
  "eventDate",
  "verificationUrl",
]);

const sensitiveFields = new Set([
  "phone",
  "phonenumber",
  "mobile",
  "email",
  "address",
  "idnumber",
  "governmentid",
  "medical",
  "password",
  "token",
  "secret",
  "手机号",
  "邮箱",
  "地址",
  "身份证号",
]);

function normalizedField(field: string): string {
  return field.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
}

export function validateRecordFields(fields: string[], source: "CSV" | "JSON"): void {
  const noun = source === "CSV" ? "column" : "field";
  if (new Set(fields).size !== fields.length) throw new Error(`${source} contains duplicate ${noun}s.`);
  for (const field of fields) {
    if (sensitiveFields.has(normalizedField(field))) {
      throw new Error(`Sensitive ${source} ${noun} is not accepted: ${field}. Use an opaque recipientId instead.`);
    }
    if (!allowedRecordFields.has(field)) throw new Error(`Unsupported ${source} ${noun}: ${field}.`);
  }
  for (const required of ["recipientId", "recipientName", "achievement"]) {
    if (!fields.includes(required)) throw new Error(`${source} is missing required ${noun}: ${required}.`);
  }
}

export function normalizeCertificateRecord(
  source: Record<string, unknown>,
  location: string,
): CertificateRecord {
  for (const [field, value] of Object.entries(source)) {
    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${location}: ${field} must be a string.`);
    }
  }

  const recipientId = cleanText(source.recipientId);
  const recipientName = cleanText(source.recipientName);
  const achievement = cleanText(source.achievement);
  const category = cleanText(source.category);
  const eventDate = cleanText(source.eventDate);
  const verificationUrl = cleanText(source.verificationUrl);

  assertSafeOpaqueId(recipientId);
  if (!recipientName) throw new Error(`${location}: recipientName is required.`);
  if (!achievement) throw new Error(`${location}: achievement is required.`);
  if (verificationUrl) validateUrl(verificationUrl);

  return {
    recipientId,
    recipientName,
    achievement,
    ...(category ? { category } : {}),
    ...(eventDate ? { eventDate } : {}),
    ...(verificationUrl ? { verificationUrl } : {}),
  };
}
