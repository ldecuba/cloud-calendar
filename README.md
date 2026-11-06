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

The combined Coming up list includes Netherlands and online events in chronological order, respects search/topic/format filters, and hides events after their final calendar day in Europe/Amsterdam. It shows events starting or running in the next seven days, with five on the calendar page. Show all opens `coming-up.html`, carrying the active search, topic and format filters in the URL. The full page lists all matching upcoming events and offers Clear filters and a link back to the calendar.

Today opens the separate `today.html` page, with event cards and a link back to the month calendar. The day selection uses Europe/Amsterdam, including daylight saving time. Date-only ranges include both the start and end day for continuous multi-day events. Listings marked `scheduleType: "series"` appear only on their verified `sessionDates`; a cohort range does not count as a daily session. The page checks for a new Netherlands calendar day every 30 seconds and when returning to the tab. `calendar.js` supplies shared behavior; `calendar-layout.css` provides the compact calendar layout.

## Publish

Push the repository to GitHub on the `main` branch. The GitHub Actions workflow tests the updater and deploys `dist` to GitHub Pages automatically.
