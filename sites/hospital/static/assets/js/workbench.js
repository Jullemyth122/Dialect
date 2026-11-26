// The review workbench. App.page holds the page state and the operations that both the
// page's own buttons and the assistant's website_* tools call (site-actions.js), so the
// rules live in one place. Only a test's code, name, unit and normal range are ever kept.
import { h, announce, download, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { parseCsv, toCsv } from "../lib/csv.js";
import { shortlist, checkSuggestion } from "../lib/candidates.js";
import { toConceptMap } from "../lib/conceptmap.js";

const LABELS = { pending: "Not reviewed", confident: "Confident", check: "Please check", approved: "Approved", skipped: "Skipped" };
const BADGE = { pending: "badge-pending", confident: "badge-confident", check: "badge-check", approved: "badge-approved", skipped: "badge-skipped" };
const FIELDS = ["code", "name", "unit", "range"];
const MAX_ROWS = 500;
const MAX_BYTES = 200_000;

class Workbench {
  constructor() {
    this.rows = [];
    this.version = 0;
    this.subset = null;
    this.source = "";
    this.filter = "all";
    this.aliasKey = `dialect:${SITE.id}:alias-table:v1`;
    this.focusCode = null;
    this.ready = new Promise((resolve) => { this.markReady = resolve; });
  }

  async init() {
    this.subset = await loadJson("/data/loinc-subset.json");
    this.bindUi();
    const sample = await fetch("/data/catalogue.csv").then((r) => r.text());
    this.loadCatalogueText(sample, "Sample test list (synthetic)");
    this.markReady();
  }

  // ---- Alias table: this hospital's approved matches, kept in this browser only ----
  aliases() {
    try { return JSON.parse(localStorage.getItem(this.aliasKey) || "{}"); } catch { return {}; }
  }
  saveAliases(map) {
    try { localStorage.setItem(this.aliasKey, JSON.stringify(map)); } catch { /* private mode: keep going */ }
  }

  entry(code) { return this.subset?.codes.find((c) => c.code === code) ?? null; }
  row(code) { return this.rows.find((r) => r.code === code) ?? null; }
  counts() {
    const counts = { all: this.rows.length, pending: 0, confident: 0, check: 0, approved: 0, skipped: 0 };
    for (const r of this.rows) counts[r.status] += 1;
    return counts;
  }

  // ---- Operations (also exposed to the assistant in site-actions.js) ----

  /** Load a test list. Keeps only code, name, unit and range (the allowlist). */
  loadCatalogueText(text, source) {
    if (text.length > MAX_BYTES) return { ok: false, reason: "The file is larger than 200 KB. Split it into smaller lists." };
    const records = parseCsv(text);
    if (!records.length) return { ok: false, reason: "The file has no rows." };
    const missing = FIELDS.filter((f) => !(f in records[0]));
    if (missing.length) return { ok: false, reason: `Missing column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}. The file needs code, name, unit and range.` };
    const aliases = this.aliases();
    const seen = new Set();
    const rows = [];
    for (const record of records) {
      const code = record.code.slice(0, 32);
      if (!code || seen.has(code)) continue;
      seen.add(code);
      const row = { code, name: record.name.slice(0, 120), unit: record.unit.slice(0, 24), range: record.range.slice(0, 40), status: "pending", suggestion: null, approved: null };
      const saved = aliases[code];
      if (saved && this.entry(saved.loinc)) {
        row.status = "approved";
        row.approved = { loinc: saved.loinc, by: "alias table", at: saved.at };
      }
      rows.push(row);
      if (rows.length >= MAX_ROWS) break;
    }
    this.rows = rows;
    this.source = source;
    this.version += 1;
    this.render();
    const remembered = rows.filter((r) => r.status === "approved").length;
    announce("#wb-status", `Loaded ${rows.length} tests from ${source}.${remembered ? ` ${remembered} already approved earlier, answered from this hospital's alias table with no AI call.` : ""}`);
    return { ok: true, rows: rows.length, alreadyApproved: remembered };
  }

  /** What the assistant may read: the worklist, never values or patients. */
  getState({ status = "all" } = {}) {
    const rows = this.rows
      .filter((r) => status === "all" || r.status === status)
      .slice(0, 60)
      .map((r) => ({
        code: r.code, name: r.name, unit: r.unit, range: r.range, status: r.status,
        ...(r.suggestion ? { suggestion: { loinc: r.suggestion.loinc, confidence: r.suggestion.confidence, reason: r.suggestion.reason } } : {}),
        ...(r.approved ? { approvedLoinc: r.approved.loinc } : {}),
      }));
    return {
      hospital: `${SITE.name} (${SITE.kind}, fictional)`,
      version: this.version,
      source: this.source,
      counts: this.counts(),
      rows,
      partners: SITE.partners.map((p) => ({ name: p.name, link: p.url })),
      note: "Synthetic data. Not for clinical use. A human must approve.",
    };
  }

  findCandidates({ code }) {
    const row = this.row(code);
    if (!row) return { ok: false, reason: `No test ${code} in the current list. Read the worklist first.` };
    return { ok: true, code, name: row.name, unit: row.unit, candidates: shortlist(row, this.subset, { limit: 4 }) };
  }

  suggestMapping({ code, loinc, confidence, reason = "" }) {
    const row = this.row(code);
    if (!row) return { ok: false, reason: `No test ${code} in the current list.` };
    if (row.status === "approved") return { ok: false, reason: `${code} is already approved as ${row.approved.loinc}.` };
    const listed = shortlist(row, this.subset, { limit: 6 }).some((c) => c.code === loinc);
    const check = checkSuggestion(row, loinc, this.subset);
    let status = confidence === "confident" ? "confident" : "check";
    let note = String(reason).slice(0, 300);
    if (status === "confident" && !check.ok) { status = "check"; note = `Moved to please check by the unit check: ${check.reason}`; }
    if (status === "confident" && !listed) { status = "check"; note = `Moved to please check: ${loinc} is not in this test's shortlist.`; }
    row.suggestion = { loinc: this.entry(loinc) ? loinc : null, confidence: status, reason: note || (status === "check" ? "Unsure." : "Name and unit fit."), by: "assistant" };
    row.status = status;
    this.version += 1;
    this.focusCode = code;
    this.render();
    return { ok: true, code, status, loinc: row.suggestion.loinc, reason: row.suggestion.reason, version: this.version };
  }

  /** The site action: save one match to this hospital's alias table. */
  saveMapping({ code, loinc, expectedVersion }, { by = "assistant" } = {}) {
    if (expectedVersion !== undefined && expectedVersion !== this.version) {
      return { ok: false, reason: `The list changed since it was read (version ${expectedVersion}, now ${this.version}). Read the worklist again.` };
    }
    const row = this.row(code);
    if (!row) return { ok: false, reason: `No test ${code} in the current list.` };
    const entry = this.entry(loinc);
    if (!entry) return { ok: false, reason: `${loinc} is not in this site's LOINC list.` };
    const check = checkSuggestion(row, loinc, this.subset);
    if (!check.ok) return { ok: false, reason: check.reason };
    const at = new Date().toISOString();
    const aliases = this.aliases();
    aliases[code] = { loinc, at, by };
    this.saveAliases(aliases);
    row.status = "approved";
    row.approved = { loinc, by, at };
    this.version += 1;
    this.focusCode = code;
    this.render();
    announce("#wb-status", `Saved ${code} as ${loinc}.`);
    return { ok: true, code, loinc, display: entry.display, savedTo: `${SITE.name}'s alias table, in this browser`, version: this.version };
  }

  /** Details for the confirmation dialog, using the same checks as saveMapping. */
  reviewSave({ code, loinc, expectedVersion }) {
    if (expectedVersion !== undefined && expectedVersion !== this.version) return { refusal: `The list changed since it was read. Read the worklist again.` };
    const row = this.row(code);
    const entry = this.entry(loinc);
    if (!row || !entry) return { refusal: `Unknown test ${code} or code ${loinc}.` };
    const check = checkSuggestion(row, loinc, this.subset);
    if (!check.ok) return { refusal: check.reason };
    return {
      "Local test": `${row.code} · ${row.name} · ${row.unit || "no unit"}`,
      "LOINC code": `${entry.code} · ${entry.display}`,
      "Saved to": `${SITE.name}'s alias table, in this browser`,
    };
  }

  skipTest({ code }) {
    const row = this.row(code);
    if (!row) return { ok: false, reason: `No test ${code} in the current list.` };
    if (row.status === "approved") return { ok: false, reason: `${code} is approved. Undo it on the page first.` };
    row.status = "skipped";
    this.version += 1;
    this.focusCode = code;
    this.render();
    return { ok: true, code, status: "skipped", version: this.version };
  }

  undo(code) {
    const row = this.row(code);
    if (!row) return;
    if (row.status === "approved") {
      const aliases = this.aliases();
      delete aliases[code];
      this.saveAliases(aliases);
      row.approved = null;
    }
    row.status = row.suggestion ? row.suggestion.confidence : "pending";
    this.version += 1;
    this.focusCode = code;
    this.render();
    announce("#wb-status", `Undid ${code}.`);
  }

  approvedRows() {
    return this.rows
      .filter((r) => r.status === "approved")
      .map((r) => ({ code: r.code, name: r.name, unit: r.unit, range: r.range, loinc: r.approved.loinc, display: this.entry(r.approved.loinc)?.display ?? "" }));
  }

  exportConceptMap() {
    const map = toConceptMap({ id: SITE.id, name: SITE.name, siteUrl: SITE.siteUrl, codeSystem: SITE.codeSystem }, this.approvedRows());
    download(`${SITE.id}-conceptmap.json`, `${JSON.stringify(map, null, 2)}\n`, "application/fhir+json");
  }

  exportCsv() {
    download(`${SITE.id}-approved-mappings.csv`, toCsv(this.approvedRows(), ["code", "name", "unit", "range", "loinc", "display"]), "text/csv");
  }

  // ---- Rendering ----

  bindUi() {
    document.querySelector("#wb-sample")?.addEventListener("click", async () => {
      const text = await fetch("/data/catalogue.csv").then((r) => r.text());
      this.loadCatalogueText(text, "Sample test list (synthetic)");
    });
    const input = document.querySelector("#wb-file");
    input?.addEventListener("change", () => input.files?.[0] && this.readFile(input.files[0]));
    const zone = document.querySelector("#wb-drop");
    if (zone) {
      zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("is-over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("is-over"));
      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("is-over");
        const file = e.dataTransfer?.files?.[0];
        if (file) this.readFile(file);
      });
    }
    document.querySelector("#wb-filter")?.addEventListener("change", (e) => {
      this.filter = e.target.value;
      this.renderRows();
    });
    document.querySelector("#wb-conceptmap")?.addEventListener("click", () => this.exportConceptMap());
    document.querySelector("#wb-csv")?.addEventListener("click", () => this.exportCsv());
  }

  async readFile(file) {
    if (file.size > MAX_BYTES) { announce("#wb-status", "That file is larger than 200 KB."); return; }
    const result = this.loadCatalogueText(await file.text(), file.name);
    if (!result.ok) announce("#wb-status", result.reason);
  }

  render() {
    this.renderCounts();
    this.renderPreview();
    this.renderRows();
    const approved = this.counts().approved;
    for (const id of ["#wb-conceptmap", "#wb-csv"]) {
      const button = document.querySelector(id);
      if (button) button.disabled = approved === 0;
    }
    const hint = document.querySelector("#wb-download-hint");
    if (hint) hint.textContent = approved ? `${approved} approved match${approved === 1 ? "" : "es"} ready to download.` : "Approve at least one match to download.";
  }

  renderCounts() {
    const counts = this.counts();
    for (const [key, value] of Object.entries(counts)) {
      const el = document.querySelector(`[data-count="${key}"]`);
      if (el) el.textContent = String(value);
    }
  }

  renderPreview() {
    const body = document.querySelector("#wb-sent tbody");
    if (!body) return;
    body.replaceChildren(...this.rows.slice(0, 8).map((r) => h("tr", {}, h("td", {}, r.code), h("td", {}, r.name), h("td", {}, r.unit || "—"), h("td", {}, r.range || "—"))));
    announce("#wb-sent-count", `${this.rows.length} tests. Showing the first ${Math.min(8, this.rows.length)}.`);
  }

  renderRows() {
    const list = document.querySelector("#wb-rows");
    if (!list) return;
    const rows = this.rows.filter((r) => this.filter === "all" || r.status === this.filter);
    if (!rows.length) {
      list.replaceChildren(h("li", { class: "empty" }, this.rows.length ? "Nothing in this pile." : "Load a test list to start."));
      return;
    }
    list.replaceChildren(...rows.map((r) => this.rowItem(r)));
    if (this.focusCode) {
      const target = list.querySelector(`[data-code="${CSS.escape(this.focusCode)}"]`) ?? list.querySelector(".row");
      target?.focus({ preventScroll: false });
      this.focusCode = null;
    }
  }

  rowItem(r) {
    const id = `row-${r.code.replace(/[^a-z0-9]/gi, "_")}`;
    const test = h("div", { class: "row-test" },
      h("span", { class: "mono", id: `${id}-code` }, r.code),
      h("span", { class: "name" }, r.name),
      h("span", { class: "meta" }, `${r.unit || "no unit"} · range ${r.range || "none"}`),
      h("span", { class: `badge ${BADGE[r.status]}` }, LABELS[r.status]),
    );
    let middle;
    let actions;
    if (r.status === "approved") {
      const entry = this.entry(r.approved.loinc);
      middle = h("div", { class: "row-done" },
        h("span", { class: "code" }, r.approved.loinc),
        h("span", {}, entry?.display ?? ""),
        h("span", { class: "small muted" }, r.approved.by === "alias table" ? "Approved earlier, from this hospital's alias table (no AI call)." : `Approved by the ${r.approved.by}.`));
      actions = h("div", { class: "row-actions" },
        h("button", { class: "button button-quiet button-small", type: "button", onclick: () => this.undo(r.code), "aria-describedby": `${id}-code` }, "Undo"));
    } else {
      const candidates = shortlist(r, this.subset, { limit: 3 });
      const chosen = r.suggestion?.loinc ?? candidates.find((c) => c.unit !== "clash")?.code ?? null;
      if (!candidates.length) {
        middle = h("div", { class: "row-choice" }, h("p", { class: "row-reason" }, "No candidate in this site's LOINC list. Skip it, or ask the lab what this test is."));
      } else {
        const fieldset = h("fieldset", {},
          h("legend", { class: "visually-hidden" }, `LOINC candidates for ${r.code}`),
          ...candidates.map((c, i) => {
            const inputId = `${id}-c${i}`;
            return h("label", { class: `cand${c.unit === "clash" ? " is-clash" : ""}`, for: inputId },
              h("input", { type: "radio", name: `${id}-pick`, id: inputId, value: c.code, checked: c.code === chosen }),
              h("span", {}, h("span", { class: "code" }, c.code), " ", c.display),
              h("span", { class: "why" }, c.reason));
          }));
        middle = h("div", { class: "row-choice" }, fieldset,
          r.suggestion ? h("p", { class: "row-reason" }, h("strong", {}, r.suggestion.confidence === "confident" ? "Assistant: confident. " : "Assistant: please check. "), r.suggestion.reason) : null);
      }
      const approve = h("button", {
        class: "button button-accent button-small", type: "button", disabled: !candidates.length, "aria-describedby": `${id}-code`,
        onclick: (event) => {
          const picked = event.currentTarget.closest(".row").querySelector("input[type=radio]:checked");
          if (!picked) { announce("#wb-status", `Choose a code for ${r.code} first.`); return; }
          const result = this.saveMapping({ code: r.code, loinc: picked.value }, { by: "analyst" });
          if (!result.ok) announce("#wb-status", `${r.code}: ${result.reason}`);
        },
      }, "Approve");
      const skip = h("button", { class: "button button-quiet button-small", type: "button", "aria-describedby": `${id}-code`, onclick: () => this.skipTest({ code: r.code }) }, r.status === "skipped" ? "Skipped" : "Skip");
      if (r.status === "skipped") skip.disabled = true;
      actions = h("div", { class: "row-actions" }, approve, skip);
    }
    return h("li", { class: "row", tabindex: "-1", "data-code": r.code, "aria-labelledby": `${id}-code` }, test, middle, actions);
  }
}

export class App {
  static page = new Workbench();
}

if (typeof document !== "undefined" && document.querySelector("#wb-rows")) {
  App.page.init().catch((error) => {
    console.error(error);
    announce("#wb-status", "The workbench could not load its data. Reload the page to try again.");
  });
}
