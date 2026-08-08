import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { generateCertificates, writeCertificates } from "../src/generate.js";

const config = {
  eventName: "Open Community Games",
  issuer: "Open Sports Foundation",
  issueDate: "2026-08-08",
  idPrefix: "OCG",
} as const;

const records = [
  { recipientId: "athlete-001", recipientName: "Sample Athlete", achievement: "Participation Award" },
  { recipientId: "athlete-002", recipientName: "示例运动员", achievement: "体育精神奖" },
];

test("generates safe file names that do not contain recipient names", () => {
  const certificates = generateCertificates(records, config);
  assert.equal(certificates.length, 2);
  for (const certificate of certificates) {
    assert.match(certificate.fileName, /^ocg-[a-f0-9]{12}\.svg$/);
    assert.doesNotMatch(certificate.fileName, /sample|示例/i);
  }
});

test("writes SVG files and a name-free manifest", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sport-cert-test-"));
  const manifest = await writeCertificates(directory, records, config, {
    now: new Date("2026-08-08T00:00:00.000Z"),
  });
  const manifestText = await readFile(path.join(directory, "manifest.json"), "utf8");

  assert.equal(manifest.certificates.length, 2);
  assert.equal(manifest.generatedAt, "2026-08-08T00:00:00.000Z");
  assert.doesNotMatch(manifestText, /Sample Athlete|示例运动员/);
  await assert.doesNotReject(readFile(path.join(directory, manifest.certificates[0]!.fileName), "utf8"));
});

test("refuses to overwrite outputs unless explicitly allowed", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sport-cert-overwrite-"));
  await writeCertificates(directory, records, config);
  await assert.rejects(writeCertificates(directory, records, config), /Refusing to overwrite existing file/);
  await assert.doesNotReject(writeCertificates(directory, records, config, { overwrite: true }));
});

test("rejects duplicate certificate identities", () => {
  assert.throws(() => generateCertificates([records[0]!, records[0]!], config), /Duplicate certificate identity/);
});
