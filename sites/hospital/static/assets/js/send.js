// "Send results": builds the referral message a real interface engine would send. Each result
// line carries this lab's code and, when the analyst approved one on the Lab code mapping page
// (the alias table in this browser), the LOINC code. The analyst downloads the file and opens
// it on the other hospital's site. Nothing else leaves: not the test list, the approvals or keys.
import { h, announce, download, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { parseCsv } from "../lib/csv.js";
import { plainName } from "./plain-names.js";

const PATIENT = { id: "SYN-000123", name: "SYNTHETIC^PATIENT", label: "Synthetic patient SYN-000123" };
const FLAGS = ["", "H", "L", "HH", "LL", "A"];
const MAX_LINES = 40;
const $ = (s) => document.querySelector(s);

const otherId = Object.keys(SITE.hospitals).find((id) => id !== SITE.id);
const other = SITE.hospitals[otherId] ?? { name: "the other hospital" };

/** HL7 v2 escaping for text fields. */
const esc = (v) => String(v ?? "").replace(/\\/g, "\\E\\").replace(/\|/g, "\\F\\").replace(/\^/g, "\\S\\").replace(/~/g, "\\R\\").replace(/&/g, "\\T\\");
const stamp = (d = new Date()) => d.toISOString().replace(/[-:T]/g, "").slice(0, 12);

const state = { tests: [], byCode: new Map(), aliases: {}, subset: null, lines: [] };

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || "null") ?? fallback; } catch { return fallback; }
}

function loincFor(code) {
  const saved = state.aliases[code];
  if (!saved) return null;
  return state.subset.codes.find((c) => c.code === saved.loinc) ?? null;
}

function arrivesAs(code) {
  const entry = code ? loincFor(code) : null;
  if (!code) return h("span", { class: "muted" }, "Pick a test");
  if (entry) {
    return h("span", { class: "arrive arrive-ok" }, h("span", { class: "badge badge-ok" }, "Lined up"), ` ${code} + LOINC ${entry.code}`, h("small", {}, plainName(entry)));
  }
  return h("span", { class: "arrive arrive-no" }, h("span", { class: "badge badge-warn" }, "Do not compare"), ` ${code} only`,
    h("small", {}, "Not approved yet. ", h("a", { href: "/workbench.html" }, "Map it")));
}

function rowEl(line, i) {
  const id = `line-${i}`;
  const select = h("select", { id: `${id}-test`, "aria-label": `Result ${i + 1}: test` },
    h("option", { value: "" }, "Choose a test…"),
    ...state.tests.map((t) => h("option", { value: t.code, selected: t.code === line.code }, `${t.code} · ${t.name}${t.unit ? ` (${t.unit})` : ""}`)));
  const value = h("input", { id: `${id}-value`, type: "number", step: "any", inputmode: "decimal", value: line.value ?? "", "aria-label": `Result ${i + 1}: value` });
  const unit = h("span", { class: "unit" }, state.byCode.get(line.code)?.unit ?? "");
  const flag = h("select", { id: `${id}-flag`, "aria-label": `Result ${i + 1}: the lab's mark` },
    ...FLAGS.map((f) => h("option", { value: f, selected: f === (line.flag ?? "") }, f || "none")));
  const arrive = h("td", { class: "arrive-cell" }, arrivesAs(line.code));
  select.addEventListener("change", () => {
    line.code = select.value;
    unit.textContent = state.byCode.get(line.code)?.unit ?? "";
    arrive.replaceChildren(arrivesAs(line.code));
    refresh();
  });
  value.addEventListener("input", () => { line.value = value.value; refresh(); });
  flag.addEventListener("change", () => { line.flag = flag.value; refresh(); });
  const remove = h("button", { class: "icon-button icon-button-s", type: "button", "aria-label": `Remove result ${i + 1}` }, "×");
  remove.addEventListener("click", () => { state.lines.splice(i, 1); render(); });
  return h("tr", {},
    h("td", {}, select),
    h("td", {}, h("div", { class: "value-wrap" }, value, unit)),
    h("td", {}, flag),
    arrive,
    h("td", {}, remove));
}

function render() {
  $("#send-rows").replaceChildren(...(state.lines.length
    ? state.lines.map(rowEl)
    : [h("tr", {}, h("td", { colspan: "5", class: "empty-cell" }, "No results yet. Fill with sample results or add one."))]));
  refresh();
}

/** The lines that will be sent: a chosen test and a numeric value. */
function readyLines() {
  return state.lines
    .filter((l) => l.code && l.value !== "" && Number.isFinite(Number(l.value)))
    .map((l) => {
      const test = state.byCode.get(l.code);
      const entry = loincFor(l.code);
      return { code: l.code, name: test?.name ?? l.code, value: Number(l.value), unit: test?.unit ?? "", range: test?.range ?? "", flag: l.flag ?? "", loinc: entry?.code ?? null };
    });
}

function hl7(lines, collected) {
  const day = (collected || "").replace(/-/g, "");
  const segs = [
    `MSH|^~\\&|DIALECT|${esc(SITE.name)}|DIALECT|${esc(other.name)}|${stamp()}||ORU^R01^ORU_R01|SYN${stamp()}|T|2.5.1`,
    `PID|1||${PATIENT.id}^^^${esc(SITE.name)}^MR||${PATIENT.name}`,
    `OBR|1|||LAB^Lab results^L|||${day}`,
    ...lines.map((l, i) => {
      const local = `${esc(l.code)}^${esc(l.name)}^L`;
      const entry = l.loinc ? state.subset.codes.find((c) => c.code === l.loinc) : null;
      const obx3 = entry ? `${entry.code}^${esc(entry.display)}^LN^${local}` : local;
      return `OBX|${i + 1}|NM|${obx3}||${l.value}|${esc(l.unit)}|${esc(l.range)}|${esc(l.flag)}|||F`;
    }),
  ];
  return segs.join("\n");
}

function refresh() {
  const lines = readyLines();
  const mapped = lines.filter((l) => l.loinc).length;
  const collected = $("#send-date").value;
  const summary = $("#send-summary");
  if (!lines.length) {
    summary.replaceChildren(h("p", { class: "m-0" }, "Add at least one result with a value."));
  } else {
    summary.replaceChildren(
      h("p", { class: "m-0" }, h("b", {}, `${mapped} of ${lines.length}`), ` results will line up at ${other.name}.`),
      mapped < lines.length
        ? h("p", { class: "m-0 small" }, `${lines.length - mapped} will arrive under "do not compare". To fix that, approve their codes on the `, h("a", { href: "/workbench.html" }, "Lab code mapping"), " page, then come back.")
        : null);
  }
  summary.classList.toggle("is-partial", lines.length > 0 && mapped < lines.length);
  $("#send-hl7").textContent = lines.length ? hl7(lines, collected) : "The message appears here when you add a result.";
  $("#send-download").disabled = !lines.length || !collected;
  $("#send-file-note").textContent = collected ? "" : "Choose the date first.";
}

function packet() {
  const collected = $("#send-date").value;
  const lines = readyLines();
  return {
    format: "dialect-referral-v1",
    synthetic: true,
    about: "Synthetic referral message from the Dialect demo. Fictional patient and hospitals, made-up values. Not for clinical use.",
    patient: PATIENT,
    referral: { from: SITE.id, to: otherId, date: new Date().toISOString().slice(0, 10) },
    results: { [SITE.id]: { collected, lines } },
    hl7: hl7(lines, collected),
  };
}

async function main() {
  const [csv, subset, sample] = await Promise.all([
    fetch("/data/catalogue.csv").then((r) => r.text()),
    loadJson("/data/loinc-subset.json"),
    loadJson("/data/referral-SYN-000123.json"),
  ]);
  state.subset = subset;
  state.aliases = readStore(`dialect:${SITE.id}:alias-table:v1`, {});
  const mine = readStore(`dialect:${SITE.id}:my-tests:v1`, []);
  const seen = new Set();
  for (const t of [...(Array.isArray(mine) ? mine : []), ...parseCsv(csv)]) {
    if (!t.code || seen.has(t.code)) continue;
    seen.add(t.code);
    state.tests.push({ code: t.code, name: t.name ?? "", unit: t.unit ?? "", range: t.range ?? "" });
  }
  state.byCode = new Map(state.tests.map((t) => [t.code, t]));
  $("#send-date").value = new Date().toISOString().slice(0, 10);
  $("#send-date").addEventListener("change", refresh);

  const own = sample.results?.[SITE.id];
  $("#send-sample").addEventListener("click", () => {
    if (!own) return;
    state.lines = own.lines.filter((l) => state.byCode.has(l.code)).map((l) => ({ code: l.code, value: String(l.value), flag: l.flag ?? "" }));
    $("#send-date").value = own.collected;
    render();
    announce("#send-summary", `Filled ${state.lines.length} sample results.`);
  });
  $("#send-add").addEventListener("click", () => {
    if (state.lines.length >= MAX_LINES) return;
    state.lines.push({ code: "", value: "", flag: "" });
    render();
    document.querySelector(`#line-${state.lines.length - 1}-test`)?.focus();
  });
  $("#send-download").addEventListener("click", () => {
    const p = packet();
    const name = `referral-${PATIENT.id}-from-${SITE.id}.json`;
    download(name, JSON.stringify(p, null, 2));
    announce("#send-file-note", `Downloaded ${name}. Now open it at ${other.name} (next step below).`);
    $("#send-next").classList.add("is-ready");
  });
  render();
}

main().catch((error) => {
  console.error(error);
  announce("#send-summary", "This page could not load. Reload to try again.");
});
