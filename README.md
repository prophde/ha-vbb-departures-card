# VBB Departures Card

Schlanke, rahmenlose Lovelace-Karte für Home Assistant. **Keine HACS-Integration nötig.** Sie verwendet die Abfahrtsdaten eines bestehenden nativen REST-Sensors und zeigt Fahrtziel, prognostizierte Abfahrtszeit und Verspätung.

## Voraussetzungen

Ein REST-Sensor mit dem Attribut `departures` (Liste der VBB-API-Abfahrten). Beispiel für `configuration.yaml`:

```yaml
rest:
  - resource: "https://v6.vbb.transport.rest/stops/900350165/departures?duration=120&results=15"
    scan_interval: 90
    timeout: 20
    sensor:
      - name: "Schönwalde Bahn Abfahrten"
        unique_id: schoenwalde_bahn_abfahrten
        value_template: "{{ value_json.departures | count }}"
        json_attributes:
          - departures
```

**Hinweis:** Große API-Antworten können die Attributgrößenbegrenzung von Home Assistant überschreiten. In diesem Fall die REST-Daten vor dem Speichern auf die nötigen Felder reduzieren.

## Installation ohne HACS

1. Die Datei `vbb-departures-card.js` aus diesem Repository nach `/config/www/vbb-departures-card.js` in Home Assistant kopieren (gegebenenfalls Ordner `www` anlegen).
2. Unter **Einstellungen → Dashboards → Ressourcen** die URL `/local/vbb-departures-card.js` als **JavaScript-Modul** hinzufügen. Falls Ressourcen nicht angezeigt werden, das Dashboard im erweiterten Modus verwalten.
3. Browser/Dashboard neu laden und eine manuelle Karte mit folgendem YAML hinzufügen:

```yaml
type: custom:vbb-departures-card
entity: sensor.schonwalde_bahn_abfahrten
title: "🚆 Abfahrten"
station: "Schönwalde (BAR), Bahnhof"
line: RB27
max_departures: 5
```

`line` kann weggelassen werden, um alle Linien anzuzeigen. `max_departures` ist auf 1–20 begrenzt.

## Verhalten

- Zeigt `when` (Echtzeitprognose), sonst `plannedWhen`.
- Positive Verspätung rot; `delay: 0` grün; unbekannte Verspätung ohne Kennzeichnung.
- `cancelled: true` als Ausfall.
- Reagiert auf Aktualisierungen der Home-Assistant-Entität.
- Text aus der API wird ausschließlich als Text eingefügt, nicht als HTML interpretiert.

## Status

**Experimentelle Erstversion, noch nicht in Home Assistant getestet.** Vor Entfernen der bisherigen Karte bitte parallel prüfen. Keine offizielle VBB- oder Home-Assistant-Integration.
