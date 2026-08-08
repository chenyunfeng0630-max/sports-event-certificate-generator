# Maintainer private pilot — August 2026

## Evidence label

**Maintainer-run private real-event-data pilot.** This is evidence of a real operational test by the project maintainer. It is not external adoption, an independent audit, or evidence of broad usage.

## Scope

The maintainer ran the packaged `v0.2.0` candidate inside an access-controlled environment against records from one real 2026 community martial-arts event. The original data stayed in its protected environment. No participant input, generated certificate, organization asset, private URL, or event name was added to this repository.

Of 252 source records, 251 records with `issued` status were selected. One draft record was deliberately excluded.

## Procedure

1. Transform only certificate-required fields into a temporary JSON file.
2. Replace source identifiers with one-way hashed opaque IDs.
3. Run `validate` and inspect its privacy-safe report.
4. Generate all 251 SVG certificates twice in separate temporary directories.
5. Compare every generated SVG file name and SHA-256 digest between runs.
6. Scan generated output for source phone numbers and government identifiers.
7. Scan reports and console output for names, opaque recipient IDs, certificate numbers, issuer, and event name.
8. Confirm that the protected source file was unchanged.
9. Remove all temporary input, output, package, and audit files.

## Results

| Check | Result |
| --- | ---: |
| Issued records validated | 251 |
| SVG certificates per generation run | 251 |
| Full generation runs | 2 |
| File-name and SVG-digest mismatches | 0 |
| Phone or government-ID values found in generated output | 0 |
| Private source values found in reports or console output | 0 |
| Writes to the protected source | 0 |
| Temporary pilot artifacts retained | 0 |

The tool therefore passed this maintainer pilot for deterministic generation, source immutability, and the tested privacy boundaries. External evaluation and independent adoption remain open goals; please use the repository's adopter-feedback issue form to report either one without participant data.
