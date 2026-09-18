# Contributing to Indicadores

Thank you for helping improve Indicadores. Contributions should keep the project practical, transparent, and safe for people working with operational data.

## Before you start

- Search existing issues and pull requests to avoid duplicate work.
- Open an issue before a large feature or architectural change so the scope can be discussed.
- Never include real company, employee, client, financial, or production data in issues, tests, screenshots, or commits.
- Keep pull requests focused. Unrelated changes should be submitted separately.

## Local development

```bash
git clone https://github.com/gustavodiaas/indicadores.git
cd indicadores
npm install
npm run dev
```

Before submitting a pull request, run:

```bash
npm run lint
npm test
npm run build
```

The repository also includes Bun lockfiles, so contributors may use Bun for local development. Please avoid changing lockfiles unintentionally.

## Contribution workflow

1. Fork the repository and create a descriptive branch, such as `fix/import-validation` or `docs/gbo-example`.
2. Make the smallest complete change that solves the problem.
3. Add or update tests when behavior changes.
4. Update documentation when a workflow, calculation, or public behavior changes.
5. Open a pull request that explains the problem, the approach, and how the change was verified.

## Code and product guidelines

- Use TypeScript and follow the existing React component patterns.
- Preserve the browser-local privacy model unless a proposal explicitly discusses a different architecture.
- Keep user-facing Portuguese terminology consistent with the existing modules.
- Treat calculations and generated reports carefully: explain formula changes and add representative tests.
- Make interfaces usable with keyboard navigation and readable in both light and dark themes.
- Do not introduce analytics, tracking, remote storage, or third-party data transmission without prior discussion and clear documentation.

## Bug reports

A useful bug report includes:

- The affected module and expected behavior
- Steps to reproduce the problem
- Browser and operating-system versions
- A minimal example using synthetic data
- Screenshots only when they contain no private or identifying information

For security vulnerabilities, do not open a public issue. Follow [SECURITY.md](SECURITY.md).

## Pull request checklist

- [ ] The change has a focused scope and an associated issue when appropriate
- [ ] No real personal, company, or client data is included
- [ ] Lint, tests, and production build pass locally
- [ ] Tests cover new or changed behavior where practical
- [ ] Documentation reflects user-visible changes

By contributing, you agree that your contribution will be licensed under the MIT License.
