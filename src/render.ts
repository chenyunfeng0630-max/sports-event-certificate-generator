import type { CertificateRecord, ResolvedGeneratorConfig } from "./types.js";
import { escapeXml, fitFontSize } from "./utils.js";

export type RenderCertificateOptions = {
  certificateNumber: string;
};

function textLine(label: string, value: string, y: number, config: ResolvedGeneratorConfig): string {
  if (!value) return "";
  const { theme } = config;
  return `
    <text x="800" y="${y}" text-anchor="middle" font-size="26" font-weight="650" fill="${theme.muted}">${escapeXml(label)}</text>
    <text x="800" y="${y + 52}" text-anchor="middle" font-size="${fitFontSize(value, 44, 1160, 25)}" font-weight="750" fill="${theme.text}">${escapeXml(value)}</text>`;
}

export function renderCertificateSvg(
  record: CertificateRecord,
  config: ResolvedGeneratorConfig,
  options: RenderCertificateOptions,
): string {
  const { theme } = config;
  const labels = config.locale === "zh-CN"
    ? { presented: "兹授予", achievement: "项目 / 成绩", category: "组别", date: "赛事日期", number: "证书编号", issued: "签发日期" }
    : { presented: "Presented to", achievement: "Achievement", category: "Category", date: "Event date", number: "Certificate No.", issued: "Issued" };

  const recipientSize = fitFontSize(record.recipientName, 76, 1180, 36);
  const eventSize = fitFontSize(config.eventName, 36, 1160, 25);
  const categoryLine = record.category ? textLine(labels.category, record.category, 730, config) : "";
  const eventDateLine = record.eventDate ? textLine(labels.date, record.eventDate, record.category ? 850 : 790, config) : "";
  const verification = record.verificationUrl
    ? `<rect x="480" y="974" width="640" height="48" rx="24" fill="${theme.background}" opacity="0.94"/>
    <text x="800" y="1006" text-anchor="middle" font-size="20" fill="${theme.muted}">${escapeXml(record.verificationUrl)}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${theme.width}" height="${theme.height}" viewBox="0 0 ${theme.width} ${theme.height}" role="img" aria-labelledby="certificate-title certificate-description">
  <title id="certificate-title">${escapeXml(config.title)} — ${escapeXml(record.recipientName)}</title>
  <desc id="certificate-description">${escapeXml(config.eventName)}: ${escapeXml(record.achievement)}</desc>
  <rect width="${theme.width}" height="${theme.height}" fill="${theme.background}"/>
  <path d="M0 0 H1600 V150 C1290 58 1100 220 780 120 C460 20 260 170 0 76 Z" fill="${theme.primary}"/>
  <path d="M0 1131 H1600 V1008 C1280 1095 1090 935 770 1032 C450 1129 250 978 0 1050 Z" fill="${theme.primary}"/>
  <circle cx="180" cy="210" r="112" fill="${theme.accent}" opacity="0.13"/>
  <circle cx="1430" cy="910" r="150" fill="${theme.accent}" opacity="0.10"/>
  <rect x="56" y="56" width="1488" height="1019" rx="28" fill="none" stroke="${theme.accent}" stroke-width="4"/>
  <rect x="78" y="78" width="1444" height="975" rx="22" fill="none" stroke="${theme.primary}" stroke-width="2" opacity="0.35"/>
  <g font-family="${escapeXml(theme.fontFamily)}">
    <text x="800" y="248" text-anchor="middle" font-size="${fitFontSize(config.title, 72, 1220, 38)}" font-weight="850" fill="${theme.primary}">${escapeXml(config.title)}</text>
    ${config.subtitle ? `<text x="800" y="304" text-anchor="middle" font-size="28" font-weight="600" fill="${theme.muted}">${escapeXml(config.subtitle)}</text>` : ""}
    <text x="800" y="380" text-anchor="middle" font-size="${eventSize}" font-weight="700" fill="${theme.text}">${escapeXml(config.eventName)}</text>
    <text x="800" y="454" text-anchor="middle" font-size="25" font-weight="650" fill="${theme.muted}">${labels.presented}</text>
    <text x="800" y="548" text-anchor="middle" font-size="${recipientSize}" font-weight="850" fill="${theme.primary}">${escapeXml(record.recipientName)}</text>
    <path d="M390 575 H1210" stroke="${theme.accent}" stroke-width="4" stroke-linecap="round"/>
    ${textLine(labels.achievement, record.achievement, 635, config)}
    ${categoryLine}
    ${eventDateLine}
    <text x="210" y="965" font-size="23" font-weight="650" fill="${theme.muted}">${labels.number}: ${escapeXml(options.certificateNumber)}</text>
    <text x="1390" y="925" text-anchor="end" font-size="24" font-weight="700" fill="${theme.text}">${escapeXml(config.issuer)}</text>
    <path d="M1040 944 H1390" stroke="${theme.muted}" stroke-width="2" opacity="0.55"/>
    <text x="1390" y="978" text-anchor="end" font-size="21" fill="${theme.muted}">${labels.issued}: ${escapeXml(config.issueDate)}</text>
    ${verification}
  </g>
</svg>`;
}
