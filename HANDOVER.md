# HANDOVER

## Actuele status
- Bijgewerkt: 2026-11-20 09:00 (Europe/Amsterdam).
- Projectpad: C:\Users\Lisan\Documents\ChatGPT\Microsoft Cloud Events\cloud-calendar
- Taak: wekelijkse kalenderverversing voor 20 november 2026.
- Status: AFGEROND. Feed bevat 55 gevalideerde events. GitHub main en Sites-bron bevatten de refresh. Private deployment appgdep_6affff5808d0819196e0e09d096e5b11 is geslaagd op https://cloud-calendar-nl.ldecuba.chatgpt.site.
- Bestanden: dist/events.json, dist/events-data.js, dist/index.html, dist/calendar.js (nieuw), dist/calendar-layout.css (nieuw), dist/today.html (nieuw), dist/coming-up.html (nieuw), scripts/calendar-ui.test.mjs, README.md, HANDOVER.md.
- Gedrag: Today navigeert naar today.html, toont volledige eventkaarten en teruglink. Selectie en dagelijkse hercontrole expliciet Europe/Amsterdam. Meerdaagse ranges inclusief laatste datum. Banner heeft korte titel, geen decoratieve kalender; maandcellen compacter.
- Controles: 16 Node-tests geslaagd; node --check dist/calendar.js geslaagd. Browsertool faalde bij starten (kernel reset), dus echte weergave en klikken nog niet gecontroleerd.
- Beslissing: Agentic HR krijgt scheduleType=series en sessionDates=[]: cohortbereik bewijst geen dagelijkse sessie. Geen sessiedatums verzonnen. Maandkalender en Today delen eventsOnDay. Bron Microsoft Digital Accelerator bevat momenteel geen Agentic HR-vermelding. Fabric IQ-bron https://developer.microsoft.com/en-us/reactor/events/27456/ vermeldt 5 november 2026 17:00-18:00 UTC. Dit event staat niet meer in huidige lokale feed; exacte datums als regressiefixture getest.
- Commit db6a932 gepusht; Pages-run 42214942724 geslaagd. Live titel en 7-dagenfunctie bevestigd via HTTP.
- Proces: lokale Python HTTP-server gestart op 127.0.0.1:4173, sessie 67547; controleer activiteit bij hervatten.
- Hervatstap: bij de volgende wekelijkse run vanaf de nieuwe datum opnieuw bronnen controleren; geen lopend proces.

## Checkpoints
- 2026-11-20 09:00: nieuwe wekelijkse verversing gestart. Repository is schoon en main gelijk aan origin/main. Nog geen broncontrole, datawijziging of publicatie uitgevoerd.
- 2026-11-20 09:08: Microsoft-updater geslaagd. 17 nieuwe Reactor-events gevonden en verlopen events verwijderd. Handmatige broncontrole bevestigde DIWUG 24 november, Dutch Fabric 24 november, PowerAddicts 3 december en 21 januari, Workplace Ninja #7 op 9 december bij Previder Vianen. Cloud Expo 2-3 december en Microsoft AI Race Day 9 december toegevoegd. Tests en publicatie nog niet uitgevoerd.
- 2026-11-20 09:12: 55 events, venster 20 november tot en met 20 februari, nul duplicaten en nul buiten-vensterrecords. 16/16 Node-tests, events-data.js en calendar.js syntax, diffcontrole en vier vereiste assets geslaagd. Volgende stap: commit/push/deploy.
- 2026-11-20 09:16: remote had twee eventdata-commits. Merge en tests geslaagd, maar merge introduceerde dubbel reactor-27717. Eerste mergecommit werd gepusht; duplicaat daarna verwijderd en correctie b846f1b gepusht. Main is nu gecorrigeerd. Site nog niet gepubliceerd.
- 2026-11-20 09:06 UTC: commit be7d090 naar Sites-bron gepusht; private deployment appgdep_6affff5808d0819196e0e09d096e5b11 geslaagd. Live URL ongewijzigd. Geen lopende processen.
- 2026-11-06 12:04 : repository en publicatieworkflow gecontroleerd. Git vereiste een opdrachtgebonden safe.directory-instelling; geen globale configuratie gewijzigd.

## Nieuwe taak 2026-11-06 12:10
- In uitvoering: Today-knop herstellen en verlopen events automatisch uit komende lijsten filteren.
- Actuele stap: code onderzocht; Today verandert alleen de maand, zijlijsten filteren helemaal niet op vandaag.
- Volgende actie: datumfilter, dagelijkse verversing in browser en zichtbare navigatie naar vandaag toevoegen; regressiecontroles uitvoeren.

- Checkpoint 2026-11-06 12:11: datumfilters en datumwisselcontrole toegevoegd, Today focust en toont vandaag; README bijgewerkt. Volgende stap: Node-regressietests en diffcontrole. Geen deployment gestart.

- 2026-11-06 12:12: implementatie en regressietests afgerond; CI voert nu alle scripts/*.test.mjs uit.

- 2026-11-06 12:13: nieuwe taak commit en push naar main; fetch origin geslaagd. Bestaande 3 lokale commits betreffen eventdata en merge; deze gaan mee. Volgende stap: wijzigingen committen en pushen; daarna remote SHA controleren.

- 2026-11-06 12:13: commit 5891297 gemaakt; push geweigerd met 403 voor mdldecuba. HANDOVER daarna lokaal bijgewerkt.


- 2026-11-06 12:15: gebruiker vraagt push opnieuw te proberen. In uitvoering: push origin main, daarna branchstatus controleren.

- 2026-11-06 12:16: push origin main geslaagd (433e5b0 naar 5891297); branch gelijk met origin/main. Alleen lokale HANDOVER.md-statusupdates ongecommit.


- 2026-11-06 12:20: nieuwe taak in uitvoering: NL-lijst standaard 5 met Show all/Show less; Today toont afzonderlijk alle events vandaag, inclusief meerdaagse events en onafhankelijk van zoekfilters. Volgende stap: implementeren en regressietests.

- 2026-11-06 12:21: vijf-itemsweergave en Today-dagoverzicht voltooid; 12 tests geslaagd.

- 2026-11-06 12:21: nieuwe taak: commit en push geautoriseerd. Diffcontrole geslaagd; volgende stap remote ophalen, commit maken en pushen.

- 2026-11-06 12:21: commit 92f8ac1 en push geslaagd; main gelijk met origin/main. Deployment niet gecontroleerd.


- 2026-11-06 12:25: nieuwe taak in uitvoering: Today-datumselectie onderzoeken, aparte today.html maken en banner compacter voor zichtbare maandkalender. Volgende stap: gedeelde datumlogica en pagina implementeren; grensgevallen en browserweergave controleren.

- 2026-11-06 12:26: aparte pagina, Amsterdam-datumselectie en compacte banner gemaakt. 13 tests geslaagd; browsertool niet beschikbaar.

- 2026-11-06 12:27: gebruiker geeft Agentic HR en Modeling Your Business with Ontologies in Fabric IQ als onjuiste Today-events. In uitvoering: eventdata en bronnen controleren; daarna gerichte correctie en tests.

- 2026-11-06 12:30: twee voorbeelden onderzocht; cohort metadata toegevoegd en gedeelde dagselectie aangepast. 14 tests, syntax en diffcontrole geslaagd. Tekstbestanden expliciet UTF-8 opgeslagen na gevonden encodingfout. Niet gepusht.

- 2026-11-06 12:31: nieuwe taak in uitvoering: beide komende lijsten combineren tot Coming up, vijf events met uitklapknop en gezamenlijke datumfilter. Volgende actie: HTML, logica en regressietests aanpassen.

- 2026-11-06 12:32: Coming up voltooid; 15 tests geslaagd, syntax en diffcontrole geslaagd. Nog geen commit/push.

- 2026-11-06 12:33: nieuwe taak in uitvoering: Show all navigeert naar coming-up.html met volledige lijst en behoud van filters. Volgende stap: pagina en navigatie toevoegen, regressietests aanpassen.

- 2026-11-06 12:33: coming-up.html toegevoegd; Show all is normale link met query/topic/format in URL. Alle komende matches zonder limiet; Clear filters, teruglink en eventdetails beschikbaar. 16 tests, syntax- en diffcontrole geslaagd. Geen browsercontrole of push.

- 2026-11-06 12:34: gebruiker autoriseert commit en push van alle openstaande kalenderwijzigingen. In uitvoering: remote ophalen, commit en push, daarna branchstatus controleren.

- 2026-11-06 12:34: commit 999b53f gemaakt en push geslaagd. Branch main gelijk met origin/main. Alle 10 gewijzigde bestanden meegenomen; deployment niet gecontroleerd.

- 2026-11-06 12:51: nieuwe taak: wijzigingen niet zichtbaar op live site. In uitvoering: Actions en geserveerde bestanden controleren; oorzaak oplossen.

- 2026-11-06 12:52: oorzaak bevestigd: Actions 42211287302 faalde door lokale tijdzone in testfixture. Testdatums nu expliciet +01:00; alle 16 tests onder TZ=UTC geslaagd. Volgende actie: correctie committen/pushen en deployment plus live bestanden controleren.

- 2026-11-06 12:54: publicatieprobleem opgelost: test gebruikte systeemtijdzone, nu expliciete offset. 16 tests onder UTC geslaagd; cf1afb8 gepusht; Actions geslaagd en vijf live bestanden met HTTP 200 bevestigd.

- 2026-11-06 13:01: taak in uitvoering: titel/ondertitel updaten, em-dash weghalen, kalender max 1 event per dag met klikbare +N more, Coming up beperken tot 7 dagen. Volgende stap: lokale bestanden aanpassen en status noteren.

- 2026-11-06 13:02: gebruiker autoriseert publicatie van titel-, kalender- en 7-dagenwijzigingen. Diffcontrole voltooid; volgende stap commit/push en Pages-run controleren.

- 2026-11-06 13:04: CI-fout gerepareerd. Vier verouderde 2099-fixtures vervangen door datums binnen zeven dagen; volledige lokale suite 16/16 geslaagd. Commit en push nu.

- 2026-11-06 13:06: 16/16 tests geslaagd lokaal. Testfixtures gecorrigeerd op 7-dagenvenster. Commit db6a932 gepusht; GitHub Pages-run succesvol; live titel, 7-dagenfilter en 1-eventkalender HTTP gecontroleerd.


- 2026-11-06 13:24: nieuwe taak: em-dash in datumbereik als encodingglitch gemeld. In uitvoering: bereiklabel op ASCII 'to' gezet, commit/push publiceren.

- 2026-11-06 13:26: gebruiker verduidelijkt dat glitch in banner staat. Verwijder dynamisch datumbereik uit banner; statische Next 3 months blijft. Daarna push en deployment controleren.

- 2026-11-06 13:38: nieuwe taak: Coming up topicfilter moet events voorbij 7 dagen tonen. In uitvoering: vensterlimiet opgeheven zodra topic actief is; toekomstfilter blijft. Volgende stap: code inspecteren en documenteren.

- 2026-11-06 13:50: gebruiker autoriseert push van uitzondering voor topicfilter. Diffcontrole uitvoeren, commit en push.
