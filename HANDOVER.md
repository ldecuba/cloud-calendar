# HANDOVER

## Actuele status
- Bijgewerkt: 2026-11-06 12:12 (Europe/Amsterdam).
- Projectpad: C:\Users\Lisan\Documents\ChatGPT\Microsoft Cloud Events\cloud-calendar
- Taak: Today-knop en verlopen events in komende lijsten herstellen.
- Status: lokale implementatie afgerond; niet gepubliceerd.
- Gewijzigd: dist/index.html, README.md, .github/workflows/pages.yml, scripts/calendar-ui.test.mjs, HANDOVER.md.
- Gedrag: kalender opent huidige maand; Today rendert, focust en scrollt naar vandaag. Beide komende lijsten verbergen events na hun laatste kalenderdag op basis van de lokale browserdatum. Controle bij laden, elke 30 seconden en bij terugkeer naar tab. Kalenderhistorie blijft beschikbaar; wekelijkse import blijft ongewijzigd.
- Controles: 10 Node-tests geslaagd (4 UI-logica, 6 updater); git diff --check geslaagd. Tests gebruiken echte eventdata en een gesimuleerde DOM.
- Nog niet gecontroleerd: echte browserinteractie en live website. Geen deployment of push uitgevoerd.
- Lopende processen: geen gestart.
- Hervatstap: browsercontrole; bij publiceren eerst de 3 bestaande lokale commits beoordelen en remote bijwerken. Origin: https://github.com/ldecuba/cloud-calendar.git.

## Checkpoints
- 2026-11-06 12:04 : repository en publicatieworkflow gecontroleerd. Git vereiste een opdrachtgebonden safe.directory-instelling; geen globale configuratie gewijzigd.

## Nieuwe taak 2026-11-06 12:10
- In uitvoering: Today-knop herstellen en verlopen events automatisch uit komende lijsten filteren.
- Actuele stap: code onderzocht; Today verandert alleen de maand, zijlijsten filteren helemaal niet op vandaag.
- Volgende actie: datumfilter, dagelijkse verversing in browser en zichtbare navigatie naar vandaag toevoegen; regressiecontroles uitvoeren.

- Checkpoint 2026-11-06 12:11: datumfilters en datumwisselcontrole toegevoegd, Today focust en toont vandaag; README bijgewerkt. Volgende stap: Node-regressietests en diffcontrole. Geen deployment gestart.

- 2026-11-06 12:12: implementatie en regressietests afgerond; CI voert nu alle scripts/*.test.mjs uit.

- 2026-11-06 12:13: nieuwe taak commit en push naar main; fetch origin geslaagd. Bestaande 3 lokale commits betreffen eventdata en merge; deze gaan mee. Volgende stap: wijzigingen committen en pushen; daarna remote SHA controleren.
