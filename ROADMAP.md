# Roadmap: VBB Departures Card v2

Die funktionierende erste Version bleibt unverändert auf `main`. Änderungen werden auf `development` entwickelt und erst nach Tests übernommen.

## Ziele

- [ ] Haltestellensuche per Namen mit Auswahl eindeutiger Stop-ID
- [ ] Optionaler Linienfilter und konfigurierbare Anzahl der Abfahrten
- [ ] Visueller Lovelace-Karteneditor
- [ ] Einfache Installation und verständliche Dokumentation für andere HA-Anwender
- [ ] Fehlerzustände, Ausfälle, Echtzeit- und Planzeiten zuverlässig darstellen
- [ ] Aktualisierung und API-Limits sinnvoll behandeln

## Technische Entscheidung vor Implementierung

1. Prüfen, ob `https://v6.vbb.transport.rest` Browser-Anfragen von Home Assistant zulässt (CORS).
2. Wenn ja: Browser-Datenabruf mit kontrolliertem Polling, Cleanup und Fehleranzeige prototypisieren.
3. Wenn nein: Native HA-REST-Sensoren oder eine schlanke eigene Backend-Integration evaluieren. Kein unsicherer CORS-Proxy.
4. Stationssuche mit eindeutiger Haltestellen-ID testen (Namensdopplungen berücksichtigen).
5. Bestehende `entity:`-Konfiguration als Rückwärtskompatibilität erhalten.

## Abnahme

- Funktioniert auf Desktop und iPad.
- Keine Regression der bestehenden REST-Sensor-Karte.
- Keine Secrets in Dashboard-Konfiguration oder Repository.
- README enthält Einrichtung und bekannte Einschränkungen.
