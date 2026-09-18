# Security policy

## Supported versions

Indicadores is currently maintained on the `main` branch and has not published versioned releases. Security fixes are applied to the latest code only.

## Reporting a vulnerability

Please do not report security vulnerabilities in a public GitHub issue.

Use GitHub's private vulnerability reporting feature for this repository if it is available. If it is not available, contact the maintainer through the contact method listed on the [maintainer's GitHub profile](https://github.com/gustavodiaas) and include only a brief request for a private reporting channel. Do not send exploit details or sensitive data through a public discussion.

A useful private report includes:

- The affected component or workflow
- Reproduction steps using synthetic data
- The impact you believe is possible
- Any suggested mitigation

Please allow a reasonable amount of time for review before public disclosure.

## Security and privacy notes

- The application currently runs without a backend or user accounts.
- Project state is stored in the browser's `localStorage`.
- Imported `.lean` and spreadsheet files are processed in the browser.
- Generated reports and exported project files are created on the user's device.
- Users should avoid entering sensitive information on shared devices and should protect exported files appropriately.

This architecture reduces server-side data exposure, but it does not make imported files or local devices inherently safe. Contributions that parse imported data should validate input defensively and avoid executing embedded content.
