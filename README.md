# AI Roadmap Studio

A static GitHub Pages site for tracking AI learning progress, lesson work, and proof-of-skill examples.

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The site is configured for GitHub Pages at `/ai-roadmap/`. Push `main` to a GitHub repository named `ai-roadmap`, then enable Pages with GitHub Actions as the source.

Expected URL:

```text
https://<github-user>.github.io/ai-roadmap/
```

## Data Model

Progress, notes, confidence ratings, focus flags, and uploaded proof examples are stored locally in the browser with IndexedDB. Use the Import/Export panel in the app to back up or move work between browsers.
