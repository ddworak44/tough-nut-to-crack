# sora scripts (quick demo)

Small Node scripts for creating OpenAI Sora video jobs, polling status, and downloading results.

## Security notes (read before publishing)

- The scripts require an OpenAI API key via environment variable `OPENAI_API_KEY`.
- **Never commit** a real key. This repo ignores `.env` and `.env.*` already.
- Outputs can include **your private images/videos**. Avoid committing generated artifacts (see `.gitignore`).

## Setup

- Node **18+**
- Install deps:
  - `npm install`

Create a local env file:

- Copy `OPENAI_API_KEY.env.example` to `.env`
- Set `OPENAI_API_KEY`

## Commands

- Before/After transition video:
  - `npm run sora:before-after -- assets/before.png assets/after.png output/transition.mp4`

Other helper scripts:

- `node get-video-status.js video_<id>`
- `node download-video.mjs video_<id> output.mp4`

## Repo hygiene

- `package.json` currently references `scripts/generate-video.mjs` in the `generate` script; that file is not present.
