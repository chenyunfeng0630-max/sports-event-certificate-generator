import type { CertificateRecord } from "./types.js";
import { normalizeCertificateRecord, validateRecordFields } from "./records.js";

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
  validateRecordFields(header, "CSV");

  return rows.map((values, rowIndex) => {
    const row = Object.fromEntries(header.map((column, columnIndex) => [column, values[columnIndex] ?? ""]));
    return normalizeCertificateRecord(row, `Row ${rowIndex + 2}`);
  });
}
