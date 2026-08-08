import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { resolveConfig } from "./config.js";
import { createCertificateNumber } from "./id.js";
import { renderCertificateSvg } from "./render.js";
import type { CertificateRecord, GeneratedCertificate, GeneratorConfig, Manifest } from "./types.js";

export function generateCertificates(records: CertificateRecord[], inputConfig: GeneratorConfig): GeneratedCertificate[] {
  if (!records.length) throw new Error("At least one certificate record is required.");
  const config = resolveConfig(inputConfig);
  const certificateNumbers = new Set<string>();

  return records.map((record) => {
    const certificateNumber = createCertificateNumber(record, config);
    if (certificateNumbers.has(certificateNumber)) {
      throw new Error(`Duplicate certificate identity produced: ${certificateNumber}.`);
    }
    certificateNumbers.add(certificateNumber);
    const fileName = `${certificateNumber.toLowerCase()}.svg`;
    return {
      certificateNumber,
      recipientId: record.recipientId,
      fileName,
      ...(record.verificationUrl ? { verificationUrl: record.verificationUrl } : {}),
      svg: renderCertificateSvg(record, config, { certificateNumber }),
    };
  });
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function writeCertificates(
  outputDirectory: string,
  records: CertificateRecord[],
  inputConfig: GeneratorConfig,
  options: { overwrite?: boolean; now?: Date } = {},
): Promise<Manifest> {
  const resolvedConfig = resolveConfig(inputConfig);
  const certificates = generateCertificates(records, resolvedConfig);
  await mkdir(outputDirectory, { recursive: true });

  const targets = [...certificates.map((certificate) => path.join(outputDirectory, certificate.fileName)), path.join(outputDirectory, "manifest.json")];
  if (!options.overwrite) {
    for (const target of targets) {
      if (await exists(target)) throw new Error(`Refusing to overwrite existing file: ${target}`);
    }
  }

  await Promise.all(
    certificates.map((certificate) => writeFile(path.join(outputDirectory, certificate.fileName), certificate.svg, "utf8")),
  );

  const manifest: Manifest = {
    schemaVersion: 1,
    generatedAt: (options.now ?? new Date()).toISOString(),
    eventName: resolvedConfig.eventName,
    certificates: certificates.map(({ svg: _svg, ...certificate }) => certificate),
  };
  await writeFile(path.join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}
