import { createHash } from "node:crypto";
import type { CertificateRecord, ResolvedGeneratorConfig } from "./types.js";
import { cleanText } from "./utils.js";

export function createCertificateNumber(
  record: CertificateRecord,
  config: Pick<ResolvedGeneratorConfig, "eventName" | "idPrefix" | "namespace">,
): string {
  const identity = [
    cleanText(config.namespace).toLowerCase(),
    cleanText(config.eventName).toLowerCase(),
    cleanText(record.recipientId).toLowerCase(),
    cleanText(record.achievement).toLowerCase(),
    cleanText(record.category).toLowerCase(),
  ].join("|");

  const digest = createHash("sha256").update(identity).digest("hex").slice(0, 12).toUpperCase();
  return `${config.idPrefix}-${digest}`;
}
