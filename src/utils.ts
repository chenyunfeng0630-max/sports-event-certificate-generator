export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function fitFontSize(value: string, baseSize: number, width: number, minimum = 24): number {
  const estimatedWidth = Array.from(value).reduce((total, character) => {
    if (/[A-Za-z0-9]/.test(character)) return total + baseSize * 0.58;
    if (/[()（）/·\-_,.]/.test(character)) return total + baseSize * 0.42;
    return total + baseSize;
  }, 0);

  if (estimatedWidth <= width) return baseSize;
  return Math.max(minimum, Math.floor(baseSize * (width / estimatedWidth)));
}

export function assertSafeOpaqueId(value: string): void {
  if (!value) throw new Error("recipientId is required.");
  if (/^1[3-9]\d{9}$/.test(value)) {
    throw new Error("recipientId must be opaque and must not be a phone number.");
  }
  if (/^\d{17}[\dXx]$/.test(value)) {
    throw new Error("recipientId must be opaque and must not be a government ID.");
  }
  if (/@/.test(value)) {
    throw new Error("recipientId must be opaque and must not be an email address.");
  }
}

export function validateUrl(value: string): void {
  if (!value) return;
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("verificationUrl must use HTTPS (localhost is allowed for development). ");
  }
}
