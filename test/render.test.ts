import assert from "node:assert/strict";
import test from "node:test";
import { resolveConfig } from "../src/config.js";
import { createCertificateNumber } from "../src/id.js";
import { renderCertificateSvg } from "../src/render.js";

const config = resolveConfig({
  eventName: "Community Sports Day",
  issuer: "Open Sports Foundation",
  issueDate: "2026-08-08",
  idPrefix: "OSF",
});

test("creates deterministic certificate numbers", () => {
  const record = { recipientId: "athlete-001", recipientName: "Alex Chen", achievement: "Gold Medal" };
  const first = createCertificateNumber(record, config);
  const second = createCertificateNumber(record, config);
  assert.equal(first, second);
  assert.match(first, /^OSF-[A-F0-9]{12}$/);
});

test("escapes user content in SVG", () => {
  const record = {
    recipientId: "athlete-002",
    recipientName: "Alex <script>",
    achievement: 'Gold & "Best Form"',
    verificationUrl: "https://example.org/cert/002?a=1&b=2",
  };
  const certificateNumber = createCertificateNumber(record, config);
  const svg = renderCertificateSvg(record, config, { certificateNumber });

  assert.ok(svg.startsWith("<?xml"));
  assert.match(svg, /Alex &lt;script&gt;/);
  assert.match(svg, /Gold &amp; &quot;Best Form&quot;/);
  assert.match(svg, /a=1&amp;b=2/);
  assert.doesNotMatch(svg, /<script>/);
  assert.doesNotMatch(svg, /<image\b/);
});

test("renders CJK content without a brand-specific asset", () => {
  const zhConfig = resolveConfig({
    eventName: "社区体育嘉年华",
    issuer: "开放体育基金会",
    locale: "zh-CN",
    issueDate: "2026-08-08",
  });
  const record = { recipientId: "athlete-003", recipientName: "测试运动员", achievement: "体育精神奖" };
  const certificateNumber = createCertificateNumber(record, zhConfig);
  const svg = renderCertificateSvg(record, zhConfig, { certificateNumber });
  assert.match(svg, /荣誉证书/);
  assert.match(svg, /测试运动员/);
  assert.match(svg, /体育精神奖/);
});
