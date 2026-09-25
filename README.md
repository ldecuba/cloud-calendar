# Cloud Calendar NL

A static calendar for Microsoft Cloud events in the Netherlands and online.

## Run locally

Open `dist/index.html` directly, or serve the `dist` directory with any static web server.

After editing `dist/events.json`, regenerate the browser-safe data file:

```powershell
node scripts/build-event-data.mjs
```

## Publish

Push the repository to GitHub on the `main` branch. The GitHub Actions workflow deploys `dist` to GitHub Pages automatically.
