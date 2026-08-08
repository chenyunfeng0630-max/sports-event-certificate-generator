# Changelog

All notable changes are documented here. This project follows Semantic Versioning.

## [0.2.0] - 2026-08-09

### Added

- JSON input with the same strict allowlist and privacy checks as CSV.
- `validate` command and `generate --dry-run` mode that write no certificate files.
- Optional aggregate usage reports with a deterministic event fingerprint and no names, recipient IDs, or event name.
- Public adopter-feedback template and privacy-safe adoption guide.

### Changed

- Shared CSV and JSON record validation to keep privacy behavior consistent.
- Documentation for private pilots and evidence claims.

## [0.1.0] - 2026-08-09

### Added

- TypeScript library and `sport-cert` command-line interface.
- Batch CSV-to-SVG certificate generation.
- Deterministic certificate numbers and name-free file names.
- English and Simplified Chinese certificate labels.
- Configurable colors, fonts, title, issuer, date, namespace, and number prefix.
- Privacy guardrails for high-risk columns and opaque recipient identifiers.
- XML escaping, HTTPS verification-link validation, and overwrite protection.
- Name-free JSON manifest.
- Tests, CI, CodeQL, Dependabot, and sensitive-information checking.
- English and Chinese documentation, contribution guide, security policy, and roadmap.
