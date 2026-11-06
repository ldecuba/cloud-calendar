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

Run the same refresh locally with:

```powershell
node scripts/update-events.mjs
node scripts/build-event-data.mjs
```

The upcoming Netherlands and online lists hide events after their final calendar day, using the visitor’s local date. This runs on page load, checks for a new day every 30 seconds while open, and checks again when the tab becomes visible. Past events remain available in the calendar. The Netherlands list shows five upcoming events by default, with Show all / Show less controls. The Today button returns to the current month and opens a list of every event taking place today, including multi-day events, regardless of active search filters.

## Publish

Push the repository to GitHub on the `main` branch. The GitHub Actions workflow tests the updater and deploys `dist` to GitHub Pages automatically.
