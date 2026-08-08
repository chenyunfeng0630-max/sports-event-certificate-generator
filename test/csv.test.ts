import assert from "node:assert/strict";
import test from "node:test";
import { parseCertificateCsv, parseCsvRows } from "../src/csv.js";

test("parses RFC-style quoted fields and Chinese text", () => {
  const records = parseCertificateCsv(
    '\uFEFFrecipientId,recipientName,achievement,category,eventDate\r\nathlete-001,"Li, Ming",金牌,青年组,2026-08-08\r\n',
  );

  assert.deepEqual(records, [
    {
      recipientId: "athlete-001",
      recipientName: "Li, Ming",
      achievement: "金牌",
      category: "青年组",
      eventDate: "2026-08-08",
    },
  ]);
});

test("supports escaped quotes", () => {
  assert.deepEqual(parseCsvRows('name,note\nA,"Won ""Best Form"""\n'), [
    ["name", "note"],
    ["A", 'Won "Best Form"'],
  ]);
});

test("rejects sensitive columns by design", () => {
  const phone = ["138", "0000", "0000"].join("");
  assert.throws(
    () => parseCertificateCsv(`recipientId,recipientName,achievement,phone\na-1,Alex,Gold,${phone}\n`),
    /Sensitive CSV column is not accepted/,
  );
});

test("rejects phone numbers used as recipient ids", () => {
  const phone = ["138", "0000", "0000"].join("");
  assert.throws(
    () => parseCertificateCsv(`recipientId,recipientName,achievement\n${phone},Alex,Gold\n`),
    /must not be a phone number/,
  );
});
