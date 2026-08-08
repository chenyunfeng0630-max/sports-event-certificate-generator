import type { CertificateRecord } from "./types.js";
import { assertSafeOpaqueId, cleanText, validateUrl } from "./utils.js";

const allowedHeaders = new Set([
  "recipientId",
  "recipientName",
  "achievement",
  "category",
  "eventDate",
  "verificationUrl",
]);

const sensitiveHeaders = new Set([
  "phone",
  "mobile",
  "email",
  "address",
  "idnumber",
  "governmentid",
  "password",
  "token",
  "secret",
  "手机号",
  "邮箱",
  "地址",
  "身份证号",
]);

export function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const text = input.replace(/^\uFEFF/, "");

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (character === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.");
  row.push(field.replace(/\r$/, ""));
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function parseCertificateCsv(input: string): CertificateRecord[] {
  const rows = parseCsvRows(input);
  const header = rows.shift()?.map((value) => value.trim()) ?? [];
  if (!header.length) throw new Error("CSV header is required.");
  if (new Set(header).size !== header.length) throw new Error("CSV header contains duplicate columns.");

  for (const column of header) {
    const normalized = column.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "");
    if (sensitiveHeaders.has(normalized)) {
      throw new Error(`Sensitive CSV column is not accepted: ${column}. Use an opaque recipientId instead.`);
    }
    if (!allowedHeaders.has(column)) throw new Error(`Unsupported CSV column: ${column}.`);
  }

  for (const required of ["recipientId", "recipientName", "achievement"]) {
    if (!header.includes(required)) throw new Error(`CSV is missing required column: ${required}.`);
  }

  return rows.map((values, rowIndex) => {
    const row = Object.fromEntries(header.map((column, columnIndex) => [column, cleanText(values[columnIndex])]));
    const recipientId = row.recipientId ?? "";
    const recipientName = row.recipientName ?? "";
    const achievement = row.achievement ?? "";
    assertSafeOpaqueId(recipientId);
    if (!recipientName) throw new Error(`Row ${rowIndex + 2}: recipientName is required.`);
    if (!achievement) throw new Error(`Row ${rowIndex + 2}: achievement is required.`);
    if (row.verificationUrl) validateUrl(row.verificationUrl);

    return {
      recipientId,
      recipientName,
      achievement,
      ...(row.category ? { category: row.category } : {}),
      ...(row.eventDate ? { eventDate: row.eventDate } : {}),
      ...(row.verificationUrl ? { verificationUrl: row.verificationUrl } : {}),
    };
  });
}
