// The review workbench. App.page holds the page state and the operations that both the
// page's own buttons and the assistant's website_* tools call (site-actions.js), so the
// rules live in one place. Only a test's code, name, unit and normal range are ever kept.
import { h, announce, download, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { parseCsv, toCsv } from "../lib/csv.js";
import { shortlist, checkSuggestion } from "../lib/candidates.js";
import { toConceptMap } from "../lib/conceptmap.js";
import { loadByokStore, getSelectedByokProfile } from "../../runtime/byok.js";

const FIELDS = ["code", "name", "unit", "range"];
const MAX_ROWS = 500;
const MAX_BYTES = 200_000;

class Workbench {
  constructor() {
    this.rows = [];
    this.version = 0;
    this.subset = null;
    this.source = "";
    this.filter = "review";
    this.picks = new Map();
    this.expanded = new Set();
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
    const sourceEl = document.querySelector("#wb-source");
    if (sourceEl) sourceEl.textContent = source;
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
    document.querySelector("#wb-ai")?.addEventListener("click", () => this.askAi());
  }

  /**
   * Opens the assistant and sends it the review request, as if the analyst had typed it.
   * The assistant (the Meta model through the nsdeploy runtime) then calls find_candidates
   * and suggest_mapping on this page; saving still needs the analyst's approval.
   */
  askAi() {
    const panel = document.querySelector("#assistant");
    const toReview = this.rows.filter((r) => r.status === "pending" || r.status === "check").length;
    if (!this.rows.length) { announce("#wb-status", "Load a test list first."); return; }
    if (!toReview) { announce("#wb-status", "Nothing left for the AI to suggest. Approve or skip the rest."); return; }
    if (panel) panel.open = true;
    let hasKey = false;
    try { hasKey = Boolean(getSelectedByokProfile(loadByokStore())?.key); } catch { hasKey = false; }
    // A key added only for this tab (runtime settings) is not in the saved store; site.js says so here.
    if (!hasKey) hasKey = /^Assistant connected/.test(document.querySelector("#assistant-status")?.textContent ?? "");
    if (!hasKey && !SITE.publisherFunded) {
      announce("#wb-status", "The AI needs an API key first. Add your Meta key on the AI model page (link above), then press Suggest with AI again.");
      panel?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const input = document.querySelector("#ns-input");
    const send = document.querySelector("#ns-send");
    if (!input || !send || send.disabled) {
      announce("#wb-status", "The AI assistant is still starting or busy. Try again in a moment.");
      panel?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    input.value = `Suggest a standard code for each of the ${toReview} tests to review. Use find_candidates for each, then suggest_mapping. Say "please check" when unsure. Do not save anything.`;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    send.click();
    announce("#wb-status", `Asked the AI to suggest codes for ${toReview} tests. Suggestions appear in the worklist as they arrive.`);
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  }

  renderCounts() {
    const c = this.counts();
    const review = c.pending + c.confident + c.check;
    const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };
    set('[data-count="review"]', String(review));
    set('[data-count="approved"]', String(c.approved));
    set('[data-count="skipped"]', String(c.skipped));
    set("#wb-progress", `${c.approved} of ${c.all} approved`);
    set("#wb-progress-sub", c.all ? `${c.check} need a person · ${review - c.check} to review · ${c.skipped} skipped` : "Load a test list to start.");
    const bar = document.querySelector("#wb-bar");
    if (bar) bar.style.width = `${c.all ? Math.round((c.approved / c.all) * 100) : 0}%`;
    for (const id of ["#wb-conceptmap", "#wb-csv"]) {
      const button = document.querySelector(id);
      if (button) button.disabled = c.approved === 0;
    }
  }

  renderPreview() {
    const body = document.querySelector("#wb-sent tbody");
    if (!body) return;
    body.replaceChildren(...this.rows.slice(0, 8).map((r) => h("tr", {}, h("td", {}, r.code), h("td", {}, r.name), h("td", {}, r.unit || "—"), h("td", {}, r.range || "—"))));
    announce("#wb-sent-count", `${this.rows.length} tests in the list; the first ${Math.min(8, this.rows.length)} are shown.`);
  }

  renderRows() {
    const list = document.querySelector("#wb-rows");
    if (!list) return;
    const order = { check: 0, confident: 1, pending: 2 };
    const rows = this.rows
      .filter((r) => (this.filter === "review" ? r.status in order : r.status === this.filter))
      .sort((a, b) => (order[a.status] ?? 0) - (order[b.status] ?? 0));
    if (!rows.length) {
      const empty = this.filter === "review" ? (this.rows.length ? "All done. Download your matches above." : "Load a test list to start.") : "Nothing here yet.";
      list.replaceChildren(h("li", { class: "empty" }, empty));
      return;
    }
    list.replaceChildren(...rows.map((r) => this.rowItem(r)));
    if (this.focusCode) {
      const target = list.querySelector(`[data-code="${CSS.escape(this.focusCode)}"]`) ?? list.querySelector(".item");
      target?.focus();
      this.focusCode = null;
    }
  }

  /** The code shown as the suggestion: the analyst's pick, the assistant's, or the best text match. */
  guessFor(r, candidates) {
    const picked = this.picks.get(r.code);
    if (picked) return { loinc: picked, kind: "picked" };
    if (r.suggestion?.loinc) return { loinc: r.suggestion.loinc, kind: r.suggestion.confidence };
    const best = candidates.find((c) => c.unit !== "clash");
    return best ? { loinc: best.code, kind: "text" } : null;
  }

  rowItem(r) {
    const id = `i-${r.code.replace(/[^a-z0-9]/gi, "_")}`;
    const head = h("div", {}, h("span", { class: "item-code", id }, r.code), h("span", { class: "item-name" }, `${r.name} · ${r.unit || "no unit"}`));
    const attrs = { tabindex: "-1", "data-code": r.code, "aria-labelledby": id };

    if (r.status === "approved" || r.status === "skipped") {
      const entry = r.approved ? this.entry(r.approved.loinc) : null;
      const guess = r.status === "approved"
        ? h("div", { class: "item-guess" },
          h("div", { class: "line1" }, h("span", { class: "badge badge-ok" }, "Approved"), h("span", { class: "loinc" }, r.approved.loinc)),
          h("span", { class: "disp" }, entry?.display ?? ""),
          h("span", { class: "why" }, r.approved.by === "alias table" ? "Remembered from an earlier approval (no AI call)" : `Approved by the ${r.approved.by}`))
        : h("div", { class: "item-guess" }, h("div", { class: "line1" }, h("span", { class: "badge badge-muted" }, "Skipped")));
      const undo = h("button", { class: "button button-line button-s", type: "button", "aria-describedby": id, onclick: () => this.undo(r.code) }, "Undo");
      return h("li", { class: "item is-done", ...attrs }, head, guess, h("div", { class: "item-actions" }, undo));
    }

    const candidates = shortlist(r, this.subset, { limit: 3 });
    const guess = this.guessFor(r, candidates);
    const entry = guess ? this.entry(guess.loinc) : null;
    const BADGES = {
      confident: ["badge-info", "AI: confident"],
      check: ["badge-warn", "Needs a person"],
      text: ["badge-muted", "Best text match"],
      picked: ["badge-muted", "Your choice"],
    };
    const [badgeClass, badgeText] = BADGES[guess?.kind] ?? ["badge-warn", "No match found"];
    const reason = r.suggestion?.reason ?? (guess ? candidates.find((c) => c.code === guess.loinc)?.reason : "Nothing in this site's code list fits. Skip it, or ask the lab what it is.");
    const guessEl = h("div", { class: "item-guess" },
      h("div", { class: "line1" }, h("span", { class: `badge ${badgeClass}` }, badgeText), guess ? h("span", { class: "loinc" }, guess.loinc) : null),
      entry ? h("span", { class: "disp" }, entry.display) : null,
      reason ? h("span", { class: "why" }, reason) : null);

    const open = this.expanded.has(r.code);
    const changeId = `${id}-change`;
    const approve = h("button", {
      class: "button button-main button-s", type: "button", disabled: !guess, "aria-describedby": id,
      onclick: () => {
        const result = this.saveMapping({ code: r.code, loinc: guess.loinc }, { by: "analyst" });
        if (result.ok) { this.picks.delete(r.code); this.expanded.delete(r.code); }
        else announce("#wb-status", `${r.code}: ${result.reason}`);
      },
    }, "Approve");
    const change = h("button", {
      class: "button button-line button-s", type: "button", disabled: !candidates.length, "aria-expanded": String(open), "aria-controls": changeId, "aria-describedby": id,
      onclick: () => { if (open) this.expanded.delete(r.code); else this.expanded.add(r.code); this.focusCode = r.code; this.renderRows(); },
    }, "Change");
    const skip = h("button", { class: "button button-line button-s", type: "button", "aria-describedby": id, onclick: () => this.skipTest({ code: r.code }) }, "Skip");

    const parts = [head, guessEl, h("div", { class: "item-actions" }, approve, change, skip)];
    if (open) {
      parts.push(h("fieldset", { class: "item-change", id: changeId },
        h("legend", { class: "small" }, `Choose the code for ${r.code}`),
        ...candidates.map((c, i) => {
          const inputId = `${id}-c${i}`;
          const radio = h("input", { type: "radio", name: `${id}-pick`, id: inputId, value: c.code, checked: guess?.loinc === c.code });
          radio.addEventListener("change", () => { this.picks.set(r.code, c.code); this.focusCode = r.code; this.renderRows(); });
          return h("label", { class: `cand${c.unit === "clash" ? " is-clash" : ""}`, for: inputId }, radio,
            h("span", {}, h("span", { class: "c" }, c.code), c.display, h("span", { class: "w" }, c.reason)));
        })));
    }
    return h("li", { class: `item${r.status === "check" ? " is-check" : ""}`, ...attrs }, ...parts);
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
