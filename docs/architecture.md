# Architecture

The project is intentionally a small pipeline:

```text
CSV input → strict schema validation → deterministic identity → SVG renderer → files + name-free manifest
```

## Modules

- `csv.ts` parses quoted CSV and enforces the public input schema.
- `config.ts` validates project-level settings and resolves safe defaults.
- `id.ts` creates a deterministic SHA-256-based certificate number from namespace, event, opaque recipient ID, achievement, and category.
- `render.ts` creates a self-contained SVG with escaped text and no external image requests.
- `generate.ts` detects duplicate identities, protects existing files, and writes the manifest.
- `cli.ts` connects filesystem input and output without logging recipient names.

## Trust boundaries

The input operator is trusted to have participant consent and to provide correct results. The generator validates shape and common privacy hazards, but it cannot prove that an award is legitimate. A verification URL is only useful when the operator separately hosts a secure source of truth.

## Determinism

Certificate numbers are deterministic for idempotent reruns. Changing the event name, namespace, recipient ID, achievement, or category changes the number. Recipient names are deliberately excluded from identity calculation so spelling corrections do not silently produce a new credential.

## Output safety

SVG content is XML-escaped. The default renderer embeds no script, HTML, external image, or remote font. File names contain only the normalized certificate number. Manifests contain opaque recipient IDs but omit names.
