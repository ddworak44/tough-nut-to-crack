# Security Policy

## Supported Versions

This is a small script repo; updates are ad-hoc.

## Reporting a Vulnerability

If you find a security issue, please avoid opening a public issue with sensitive details.
Instead, contact the maintainer privately (e.g. via GitHub profile contact info).

## Key handling / secrets

- API keys must be provided via `OPENAI_API_KEY` environment variable.
- Do **not** commit `.env` files or any real secrets.
- Be careful with logs: API responses may include metadata you consider sensitive (prompts, ids).


