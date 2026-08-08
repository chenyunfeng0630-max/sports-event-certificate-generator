export type CertificateRecord = {
  /** An opaque, non-sensitive identifier. Never use a phone number or government ID. */
  recipientId: string;
  recipientName: string;
  achievement: string;
  category?: string;
  eventDate?: string;
  verificationUrl?: string;
};

export type CertificateTheme = {
  width: number;
  height: number;
  background: string;
  primary: string;
  accent: string;
  text: string;
  muted: string;
  fontFamily: string;
};

export type GeneratorConfig = {
  eventName: string;
  issuer: string;
  title?: string;
  subtitle?: string;
  issueDate?: string;
  locale?: "en" | "zh-CN";
  idPrefix?: string;
  namespace?: string;
  theme?: Partial<CertificateTheme>;
};

export type ResolvedGeneratorConfig = Omit<GeneratorConfig, "theme"> & {
  title: string;
  subtitle: string;
  issueDate: string;
  locale: "en" | "zh-CN";
  idPrefix: string;
  namespace: string;
  theme: CertificateTheme;
};

export type GeneratedCertificate = {
  certificateNumber: string;
  recipientId: string;
  fileName: string;
  verificationUrl?: string;
  svg: string;
};

export type Manifest = {
  schemaVersion: 1;
  generatedAt: string;
  eventName: string;
  certificates: Array<Omit<GeneratedCertificate, "svg">>;
};

export type InputFormat = "csv" | "json";

export type UsageReport = {
  schemaVersion: 1;
  toolVersion: string;
  createdAt: string;
  mode: "validate" | "generate";
  inputFormat: InputFormat;
  eventFingerprint: string;
  recordCount: number;
  certificateCount: number;
  categoryCount: number;
  verificationLinkCount: number;
  outputWritten: boolean;
  privacy: {
    containsRecipientNames: false;
    containsRecipientIds: false;
    containsEventName: false;
  };
};
