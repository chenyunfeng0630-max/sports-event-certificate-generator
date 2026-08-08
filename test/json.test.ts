import assert from "node:assert/strict";
import test from "node:test";
import { parseCertificateJson } from "../src/json.js";

test("parses JSON certificate records", () => {
  const records = parseCertificateJson(
    JSON.stringify([
      {
        recipientId: "athlete-003",
        recipientName: "JSON Example",
        achievement: "Silver Medal",
        category: "Junior",
      },
    ]),
  );
  assert.equal(records[0]?.recipientId, "athlete-003");
  assert.equal(records[0]?.category, "Junior");
});

test("rejects sensitive JSON fields", () => {
  assert.throws(
    () =>
      parseCertificateJson(
        JSON.stringify([
          { recipientId: "athlete-003", recipientName: "Example", achievement: "Gold", phoneNumber: "redacted" },
        ]),
      ),
    /Sensitive JSON field is not accepted/,
  );
});

test("rejects unsupported or non-string JSON fields", () => {
  assert.throws(
    () =>
      parseCertificateJson(
        JSON.stringify([{ recipientId: "athlete-003", recipientName: "Example", achievement: "Gold", score: 9.5 }]),
      ),
    /Unsupported JSON field/,
  );
  assert.throws(
    () =>
      parseCertificateJson(
        JSON.stringify([{ recipientId: "athlete-003", recipientName: "Example", achievement: 1 }]),
      ),
    /achievement must be a string/,
  );
});
