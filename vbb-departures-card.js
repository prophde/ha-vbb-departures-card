/* VBB Departures Card - standalone Home Assistant Lovelace custom card. */
class VbbDeparturesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._lastSignature = null;
  }

  setConfig(config) {
    if (!config || typeof config.entity !== "string" || !config.entity.startsWith("sensor.")) {
      throw new Error("Bitte eine REST-Sensor-Entität mit 'entity:' angeben.");
    }
    this._config = { title: "Abfahrten", max_departures: 5, line: "RB27", ...config };
    this._lastSignature = null;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    const state = hass.states[this._config.entity];
    const signature = JSON.stringify({
      state: state?.state,
      updated: state?.last_updated,
      departures: state?.attributes?.departures,
      locale: hass.locale?.language,
    });
    if (signature !== this._lastSignature) {
      this._lastSignature = signature;
      this._render();
    }
  }

  getCardSize() { return Math.max(2, Number(this._config.max_departures) || 5); }

  _render() {
    if (!this.shadowRoot || !this._config.entity) return;
    const state = this._hass?.states[this._config.entity];
    const departures = state?.attributes?.departures;
    const max = Math.max(1, Math.min(20, Number(this._config.max_departures) || 5));
    const filtered = Array.isArray(departures)
      ? departures.filter(d => d && (!this._config.line || d.line?.name === this._config.line)).slice(0, max)
      : [];

    this.shadowRoot.replaceChildren();
    const style = document.createElement("style");
    style.textContent = `
      :host { display: block; }
      ha-card { padding: 16px 20px 20px; }
      .title { font-size: 22px; font-weight: 500; margin: 0 0 16px; }
      .station { color: var(--secondary-text-color); margin: 0 0 14px; font-size: 15px; }
      .departure { display: grid; grid-template-columns: auto minmax(0,1fr) auto;
        gap: 14px; align-items: center; min-height: 48px; padding: 3px 0; }
      .line { background: #f00; color: #fff; border-radius: 18px;
        padding: 5px 10px; font-size: 16px; font-weight: 700; white-space: nowrap; }
      .direction { min-width: 0; overflow-wrap: anywhere; font-size: 16px; }
      .right { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
      .time { font-size: 18px; font-weight: 700; }
      .delay { font-size: 12px; vertical-align: super; font-weight: 700; }
      .late, .cancelled { color: #ef5350; }
      .ontime { color: #43a047; }
      .cancelled .time, .cancelled .direction { text-decoration: line-through; }
      .empty { color: var(--secondary-text-color); padding: 12px 0; }
      @media (max-width: 440px) {
        ha-card { padding: 14px; }
        .departure { gap: 8px; }
        .line { padding: 4px 7px; font-size: 14px; }
        .direction { font-size: 14px; }
        .time { font-size: 16px; }
      }
    `;
    this.shadowRoot.append(style);
    const card = document.createElement("ha-card");
    this.shadowRoot.append(card);
    const add = (parent, cls, value, tag = "div") => {
      const el = document.createElement(tag);
      el.className = cls;
      el.textContent = String(value ?? "");
      parent.append(el);
      return el;
    };
    add(card, "title", this._config.title);
    if (this._config.station) add(card, "station", this._config.station);
    if (!Array.isArray(departures)) {
      add(card, "empty", "Keine Abfahrtsdaten verfügbar.");
      return;
    }
    if (!filtered.length) {
      add(card, "empty", "Keine passenden Abfahrten gefunden.");
      return;
    }
    for (const d of filtered) {
      const cancelled = d.cancelled === true;
      const row = add(card, cancelled ? "departure cancelled" : "departure", "");
      const badge = add(row, "line", d.line?.name || "Zug", "span");
      const color = d.line?.color?.bg;
      if (typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)) badge.style.backgroundColor = color;
      add(row, "direction", d.direction || d.destination?.name || "Unbekannt");
      const right = add(row, "right", "");
      const timestamp = d.when || d.plannedWhen;
      const date = timestamp ? new Date(timestamp) : null;
      const time = date && !Number.isNaN(date.getTime())
        ? new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(date)
        : "--:--";
      add(right, "time", time, "span");
      if (cancelled) {
        add(right, "delay late", " Ausfall", "span");
      } else if (typeof d.delay === "number" && d.delay > 0) {
        add(right, "delay late", " +" + Math.ceil(d.delay / 60), "span");
      } else if (d.delay === 0) {
        add(right, "delay ontime", " +0", "span");
      }
    }
  }
}
if (!customElements.get("vbb-departures-card")) {
  customElements.define("vbb-departures-card", VbbDeparturesCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "vbb-departures-card")) {
  window.customCards.push({
    type: "vbb-departures-card",
    name: "VBB Departures Card",
    description: "Rahmenlose VBB-Abfahrtstafel aus einem Home Assistant REST-Sensor",
  });
}
