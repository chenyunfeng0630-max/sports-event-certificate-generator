# Security Policy

## Supported versions

Security fixes are provided for the latest released minor version.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Reporting a vulnerability

Please do not open a public issue for a vulnerability or include participant data, secrets, or exploit details in public discussions.

Use the repository's **Security → Report a vulnerability** private advisory flow. Include:

- affected version and command or API;
- impact and realistic attack scenario;
- minimal reproduction using fictional data;
- suggested mitigation, if known.

The maintainer will acknowledge a complete report within seven days and will coordinate validation, remediation, and disclosure. Timelines may vary for complex reports.

## Security boundaries

This project generates files; it does not authenticate recipients, host certificates, prove event results, create legal credentials, or verify an issuer's authority. Deployers are responsible for access control, participant consent, retention, revocation, and verification-site security.

The CLI rejects common high-risk CSV columns, but this is a guardrail rather than a data-loss-prevention system. Review every input before use.
