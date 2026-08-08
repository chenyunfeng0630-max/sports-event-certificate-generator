import type { CertificateTheme, GeneratorConfig, ResolvedGeneratorConfig } from "./types.js";
import { cleanText } from "./utils.js";

const defaultTheme: CertificateTheme = {
  width: 1600,
  height: 1131,
  background: "#f7f4ec",
  primary: "#12355b",
  accent: "#e08d2d",
  text: "#172033",
  muted: "#5f6b7a",
  fontFamily: 'Inter, "Noto Sans CJK SC", "PingFang SC", "Microsoft YaHei", sans-serif',
};

export function resolveConfig(config: GeneratorConfig): ResolvedGeneratorConfig {
  const eventName = cleanText(config.eventName);
  const issuer = cleanText(config.issuer);
  if (!eventName) throw new Error("config.eventName is required.");
  if (!issuer) throw new Error("config.issuer is required.");

  const locale = config.locale ?? "en";
  const idPrefix = cleanText(config.idPrefix || "CERT").toUpperCase().replace(/[^A-Z0-9-]/g, "-");
  if (!idPrefix) throw new Error("config.idPrefix must contain letters or numbers.");

  return {
    ...config,
    eventName,
    issuer,
    title: cleanText(config.title) || (locale === "zh-CN" ? "荣誉证书" : "Certificate of Achievement"),
    subtitle: cleanText(config.subtitle),
    issueDate: cleanText(config.issueDate) || new Date().toISOString().slice(0, 10),
    locale,
    idPrefix,
    namespace: cleanText(config.namespace) || "sports-event-certificate-generator",
    theme: { ...defaultTheme, ...config.theme },
  };
}
