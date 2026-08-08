# Contributing

Thank you for helping make sports-event certificate workflows safer and easier to reuse.

## Before opening an issue

- Search existing issues.
- Use fictional sample data only.
- Never include participant lists, phone numbers, email addresses, government IDs, addresses, credentials, private repository links, or production logs.

## Development

```bash
git clone https://github.com/chenyunfeng0630-max/sports-event-certificate-generator.git
cd sports-event-certificate-generator
npm install
npm run verify
```

Create a focused branch, add tests for behavior changes, and keep generated output out of commits unless it is an intentionally reviewed fixture.

## Pull requests

A good pull request explains:

- the problem and intended user impact;
- the chosen design and privacy implications;
- tests and commands used for verification;
- compatibility or migration concerns.

All pull requests must pass type checking, tests, the sensitive-information check, package dry-run, and GitHub Actions.

## Design principles

1. Collect the minimum data required.
2. Keep output deterministic and auditable.
3. Fail clearly on unsafe or ambiguous input.
4. Preserve offline use and a dependency-light runtime.
5. Keep branding and organization-specific assets outside the core package.

By contributing, you agree that your contributions are licensed under the MIT License.
