# Cloud Calendar NL

A static calendar for Microsoft Cloud events in the Netherlands and online.

## Run locally

Open `dist/index.html` directly, or serve the `dist` directory with any static web server.

After editing `dist/events.json`, regenerate the browser-safe data file:

```powershell
node scripts/build-event-data.mjs
```

## Automatic updates

GitHub Actions refreshes the calendar every Monday at 05:15 UTC. The updater reads the official Microsoft Developer Events directory and selects:

- Priority English Microsoft Reactor livestreams about Microsoft AI, Copilot, Microsoft Foundry, and Microsoft 365 in the next 92 days.
- A smaller selection of other English Microsoft Reactor livestreams.
- In-person events in the Netherlands in the next 92 days.
- Existing curated events that are still inside the calendar window.

The `dist/decuba-style` concept includes an autoplaying weekly event slider. It uses the current Monday-to-Sunday week when events are available, otherwise it advances to the next active week. Source-page Open Graph images are collected during the weekly refresh and used when available.

Run the same refresh locally with:

```powershell
node scripts/update-events.mjs
node scripts/build-event-data.mjs
```

## Publish

Push the repository to GitHub on the `main` branch. The GitHub Actions workflow tests the updater and deploys `dist` to GitHub Pages automatically.
