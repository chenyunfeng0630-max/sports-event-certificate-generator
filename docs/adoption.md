# Adoption and feedback

This project separates three kinds of evidence:

1. **Maintainer pilot:** the maintainers ran the tool against a real, access-controlled workflow.
2. **External evaluation:** someone outside the maintainer team tested the tool and reported feedback.
3. **Independent adoption:** an outside organization used the tool in an operational event.

These labels must not be treated as interchangeable. A fresh repository or maintainer pilot is not evidence of broad adoption.

## Run a private pilot

Keep real input and generated certificates outside the repository. Start with validation:

```bash
sport-cert validate \
  --input ./private/participants.json \
  --config ./private/config.json \
  --report ./private/usage-report.json
```

Inspect the aggregate report, then generate into an access-controlled directory. Delete private working copies according to your retention policy. A public case note may quote aggregate counts from the report, but must not publish the source file, recipient data, certificate files, event name, or reverse-mapping keys without permission.

## Report real-world use

Use the repository's **Adopter feedback** issue form. Share only what your organization is authorized to publish. Event name, organization, and contact details are optional. Never attach participant lists, certificate files, screenshots containing names, phone numbers, identity documents, or private URLs.

Maintainers may cite a public feedback issue as external evidence only when its author is genuinely independent of the maintainer team.
