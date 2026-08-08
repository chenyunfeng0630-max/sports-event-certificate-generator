# Privacy by design

## Data minimization

The public CSV and JSON schemas accept only:

- opaque recipient ID;
- display name;
- achievement;
- optional category, event date, and HTTPS verification URL.

The parser rejects common columns for phone numbers, email addresses, home addresses, government identifiers, passwords, tokens, and secrets. Unknown columns are rejected instead of being silently copied.

## Privacy-safe validation evidence

The optional usage report is designed for operational evidence without disclosing the people in an event. It contains only counts, the tool version, an input-format label, output status, and a truncated SHA-256 fingerprint derived from the configured namespace and event name. It does not contain either source value, recipient names, recipient identifiers, achievements, or certificate numbers.

The fingerprint is for grouping repeated runs of the same configured event; it is not proof that an event was independently audited or externally adopted.

## Remaining personal data

Names and certificate contents can still be personal data. This tool does not make them anonymous. Operators should:

1. obtain an appropriate legal basis or participant consent;
2. keep source CSV and JSON files outside the repository;
3. restrict access to generated files;
4. publish only what participants expect;
5. define retention and deletion procedures;
6. support corrections and revocation.

## Public issue hygiene

Never attach real participant data to an issue, pull request, test fixture, screenshot, CI log, or security report. Reproduce problems with fictional identifiers such as `athlete-001` and fictional names.

## Not legal advice

This document describes software design choices, not legal advice. Laws and organizational duties vary by jurisdiction and use case.
