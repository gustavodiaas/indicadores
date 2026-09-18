# Indicadores

An open-source, browser-based toolkit for operational indicators, Lean manufacturing analysis, action planning, and technical reporting.

[Live demo](https://indicadores-wine.vercel.app/) · [Report a bug](https://github.com/gustavodiaas/indicadores/issues/new) · [Request a feature](https://github.com/gustavodiaas/indicadores/issues/new)

> The interface is currently in Brazilian Portuguese. An English summary is provided below, followed by a Portuguese overview.

## Overview

Indicadores helps consultants, improvement teams, and operations professionals compare a process before and after an intervention, organize improvement work, and turn the results into practical reports. The application runs entirely in the browser: project data is stored locally and can be exported for backup or later use.

The project is under active development. It is public so that its calculations, workflows, and interface can be reviewed, improved, and adapted by the community. It does not claim external adoption or production guarantees.

## Features

- Operational KPI analysis for productivity, payback, movement, quality, availability, lead time, and occupied area
- Before-and-after comparisons with calculated results and charts
- Operation balancing (GBO) with takt-time analysis and Excel import/export
- 5W2H action plans, A3 reports, and standardized-work/Gantt views
- Technical report generation in Microsoft Word format
- Project backup and restore through local `.lean` files
- Light, dark, and system themes
- In-app user guide
- Browser-local processing and persistence; no application backend is currently used

## Technology

- React 18 and TypeScript
- Vite
- Tailwind CSS and shadcn/ui/Radix UI primitives
- Recharts for data visualization
- React Hook Form and Zod
- Vitest and Testing Library
- `docx`, `xlsx`, ExcelJS, jsPDF, and html2canvas for document and data workflows

## Demo

The latest public deployment is available at:

**https://indicadores-wine.vercel.app/**

The demo stores entered data in your browser's local storage. Avoid entering sensitive or regulated information on shared devices, and export a backup before clearing browser data.

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm, or Bun if you prefer to use the committed Bun lockfile

### Installation

```bash
git clone https://github.com/gustavodiaas/indicadores.git
cd indicadores
npm install
npm run dev
```

Vite will print the local URL, normally `http://localhost:5173`.

With Bun:

```bash
bun install
bun run dev
```

## Usage

1. Open the home screen and select an operational module.
2. Enter the baseline (T1) and post-improvement (T3) values requested by the module.
3. Review the calculated indicators and charts.
4. Use the summary, 5W2H, A3, GBO, or Gantt modules to document the improvement work.
5. Export a `.lean` backup or generate a Word report where available.

All calculations should be independently reviewed before they are used for financial, contractual, safety-critical, or regulatory decisions.

## Available commands

```bash
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run lint      # Run ESLint
npm test          # Run the Vitest suite once
npm run test:watch
```

## Data and privacy

The current application has no server-side database or user account system. Form state is persisted in `localStorage`; imports are read in the browser; generated files are created on the user's device. See [SECURITY.md](SECURITY.md) for responsible disclosure and security notes.

## Roadmap

The roadmap is intentionally modest and will be tracked through GitHub issues:

- Expand automated tests for calculation and import/export paths
- Add stronger schema validation and clearer error handling for imported project files
- Add continuous integration for lint, tests, and production builds
- Improve accessibility and responsive behavior across modules
- Evaluate internationalization after the Portuguese workflows stabilize

Roadmap items are proposals, not delivery commitments. Please comment on an existing issue before starting substantial work.

## Contributing

Contributions are welcome. Bug reports, focused feature proposals, documentation improvements, and tests are especially useful. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Released under the [MIT License](LICENSE).

---

## Resumo em português

O Indicadores é uma ferramenta open source executada no navegador para análise de indicadores operacionais, manufatura enxuta, planejamento de ações e geração de relatórios técnicos. O projeto reúne análises de produtividade, payback, movimentação, qualidade, disponibilidade, lead time e área, além de módulos de GBO, 5W2H, A3 e trabalho padronizado/Gantt.

Os dados são processados e armazenados localmente no navegador. Para instalar, contribuir ou reportar uma vulnerabilidade, consulte as seções e arquivos indicados acima.
