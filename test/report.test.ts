import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { createUsageReport, writeUsageReport } from "../src/report.js";

const records = [
  { recipientId: "private-athlete-001", recipientName: "Private Example", achievement: "Gold", category: "Adult" },
  { recipientId: "private-athlete-002", recipientName: "隐私示例", achievement: "Silver", category: "Junior" },
];

const config = {
  eventName: "Private Event Name",
  issuer: "Private Issuer",
  namespace: "private-event",
};

test("creates a privacy-safe aggregate usage report", () => {
  const report = createUsageReport(records, config, {
    toolVersion: "0.2.0",
    inputFormat: "json",
    mode: "validate",
    outputWritten: false,
    now: new Date("2026-08-09T00:00:00.000Z"),
  });
  const text = JSON.stringify(report);

  assert.equal(report.certificateCount, 2);
  assert.equal(report.categoryCount, 2);
  assert.equal(report.eventFingerprint.length, 16);
  assert.equal(report.privacy.containsRecipientNames, false);
  assert.doesNotMatch(text, /Private Example|隐私示例|private-athlete|Private Event Name|Private Issuer/);
});

test("writes reports with overwrite protection", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "sport-cert-report-"));
  const reportPath = path.join(directory, "usage-report.json");
  const report = createUsageReport(records, config, {
    toolVersion: "0.2.0",
    inputFormat: "json",
    mode: "generate",
    outputWritten: true,
  });
  await writeUsageReport(reportPath, report);
  await assert.rejects(writeUsageReport(reportPath, report), /Refusing to overwrite existing file/);
  await assert.doesNotReject(writeUsageReport(reportPath, report, { overwrite: true }));
  assert.doesNotMatch(await readFile(reportPath, "utf8"), /Private Example|private-athlete/);
});
