// Patient view: a sample synthetic report shown like a patient portal. Each short lab code
// is shown as the test's everyday name; explanations come only from MedlinePlus (by LOINC
// code). High/low marks are the lab's own (OBX-8); Dialect never computes one. The range
// bar only draws the lab's own range and number, and is coloured only by the lab's mark.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { explain } from "./medlineplus.js";

const FLAG_WORDS = { H: "High", L: "Low", HH: "Very high", LL: "Very low", A: "Marked" };
const longDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });

// Everyday names for the LOINC codes in our subset. The standard LOINC name is shown in "What is this test?".
const PLAIN = {
  "1558-6": "Fasting blood sugar (glucose)", "14771-0": "Fasting blood sugar (glucose)",
  "2345-7": "Blood sugar (glucose)", "14749-6": "Blood sugar (glucose)",
  "2160-0": "Creatinine", "14682-9": "Creatinine", "2951-2": "Sodium", "2823-3": "Potassium",
  "2075-0": "Chloride", "2028-9": "Bicarbonate (total CO2)", "3094-0": "Urea nitrogen (BUN)",
  "2093-3": "Total cholesterol", "14647-2": "Total cholesterol", "2085-9": "HDL cholesterol",
  "2571-8": "Triglycerides", "1975-2": "Total bilirubin", "1742-6": "ALT (alanine aminotransferase)",
  "1920-8": "AST (aspartate aminotransferase)", "17861-6": "Calcium", "718-7": "Hemoglobin",
  "4544-3": "Hematocrit", "6690-2": "White blood cell count", "777-3": "Platelet count", "4548-4": "Hemoglobin A1c",
};
const plainName = (entry) => PLAIN[entry.code] ?? entry.display.replace(/\s*\[[^\]]*\]/g, "");

/** "3.9-5.5" -> {lo, hi}; "<5.2" -> {hi}; ">40" -> {lo}; anything else -> null. */
function parseRange(text) {
  const t = String(text ?? "").replace(/\s/g, "");
  let m = /^(-?\d+(?:\.\d+)?)[-–](-?\d+(?:\.\d+)?)$/.exec(t);
  if (m) return { lo: Number(m[1]), hi: Number(m[2]) };
  if ((m = /^<=?(\d+(?:\.\d+)?)$/.exec(t))) return { hi: Number(m[1]) };
  if ((m = /^>=?(\d+(?:\.\d+)?)$/.exec(t))) return { lo: Number(m[1]) };
  return null;
}

/** Where the lab's range band and the number sit on a 0-100 track. Drawing only, no judgement. */
function placeOnTrack(value, range) {
  const v = Number(value);
  if (!range || !Number.isFinite(v)) return null;
  const clamp = (x) => Math.min(97, Math.max(3, x));
  if (range.lo !== undefined && range.hi !== undefined && range.hi > range.lo) {
    return { from: 25, to: 75, at: clamp(25 + (50 * (v - range.lo)) / (range.hi - range.lo)) };
  }
  if (range.hi !== undefined && range.hi > 0) return { from: 3, to: 70, at: clamp((70 * v) / range.hi) };
  if (range.lo !== undefined && range.lo > 0) return { from: 30, to: 97, at: clamp((30 * v) / range.lo) };
  return null;
}

function rangeBar(line) {
  const range = parseRange(line.range);
  const spot = placeOnTrack(line.value, range);
  const label = line.range ? `Lab's range ${line.range.replace("-", " – ")} ${line.unit}`.trim() : "The lab gave no range";
  if (!spot) return h("p", { class: "range-text" }, label);
  const band = h("span", { class: "range-band" });
  band.style.setProperty("--from", `${spot.from}%`);
  band.style.setProperty("--to", `${spot.to}%`);
  const dot = h("span", { class: "range-dot" });
  dot.style.setProperty("--at", `${spot.at}%`);
  return h("div", { class: "range" },
    h("div", { class: "range-track", "aria-hidden": "true" }, band, dot),
    h("p", { class: "range-text" }, label));
}

function resultRow(line, entry) {
  const id = `r-${line.code.replace(/[^a-z0-9]/gi, "_")}`;
  const onReport = h("p", { class: "result-code" }, "On your report: ", h("code", {}, line.code),
    line.name && line.name !== line.code ? ` ${line.name}` : null);
  const flag = line.flag
    ? h("span", { class: "result-flag" }, `${FLAG_WORDS[line.flag] ?? "Marked"}`, h("span", { class: "visually-hidden" }, " (marked by the lab)"))
    : null;
  const top = h("div", { class: "result-top" },
    h("div", { class: "result-name-wrap" },
      h("h3", { class: "result-name", id }, entry ? plainName(entry) : "Not identified"),
      onReport),
    h("div", { class: "result-value" },
      h("span", { class: "num" }, String(line.value)), line.unit ? h("span", { class: "unit" }, line.unit) : null, flag));

  if (!entry) {
    return h("li", { class: "result is-unknown", "aria-labelledby": id }, top,
      h("p", { class: "result-note" }, "Dialect doesn't know this code and won't guess. Ask the lab or your doctor what this test is."));
  }

  const about = h("div", { class: "about" }, h("p", { class: "muted" }, "Loading…"));
  const details = h("details", { class: "result-more" }, h("summary", {}, "What is this test?"), about);
  let loaded = false;
  details.addEventListener("toggle", () => {
    if (!details.open || loaded) return;
    loaded = true;
    const standard = h("p", { class: "about-std" }, `Standard name (LOINC ${entry.code}): ${entry.display}`);
    explain(entry.code)
      .then((info) => {
        about.replaceChildren(...[
          info.title ? h("p", { class: "about-title" }, info.title) : null,
          h("p", {}, info.text || entry.display),
          standard,
          h("p", { class: "credit" }, info.source === "medlineplus" ? "Source: MedlinePlus, National Library of Medicine. " : "", h("a", { href: info.url }, "Read more on MedlinePlus")),
        ].filter(Boolean));
      })
      .catch(() => {
        about.replaceChildren(standard, h("p", { class: "credit" }, h("a", { href: "https://medlineplus.gov/lab-tests/" }, "Look it up on MedlinePlus")));
      });
  });
  return h("li", { class: `result${line.flag ? " is-flagged" : ""}`, "aria-labelledby": id }, top, rangeBar(line), details);
}

function paperTable(report, labName) {
  const cell = (tag, text, cls) => h(tag, cls ? { class: cls } : {}, text);
  return [
    h("p", { class: "paper-note" }, `This is how ${labName}'s lab printed it. Switch to "In plain words" to see what each code means.`),
    h("div", { class: "paper-scroll", tabindex: "0", role: "region", "aria-label": "Original report" },
      h("table", { class: "paper-table" },
        h("thead", {}, h("tr", {}, ...["Code", "Name", "Result", "Units", "Ref. range", "Flag"].map((t) => cell("th", t)))),
        h("tbody", {}, ...report.lines.map((l) => h("tr", {},
          cell("td", l.code), cell("td", l.name), cell("td", String(l.value), "num"), cell("td", l.unit), cell("td", l.range), cell("td", l.flag, "flag-cell")))))),
  ];
}

async function main() {
  const [{ reports }, subset] = await Promise.all([loadJson("/data/reports.json"), loadJson("/data/loinc-subset.json")]);
  const byCode = new Map(subset.codes.map((c) => [c.code, c]));
  const list = document.querySelector("#lines");
  const paper = document.querySelector("#paper");
  const stats = document.querySelector("#stats");
  const meta = document.querySelector("#report-meta");

  const show = (report) => {
    const labName = SITE.hospitals[report.hospital]?.name ?? report.hospital;
    const entries = report.lines.map((line) => (line.loinc ? byCode.get(line.loinc) : null));
    const marked = report.lines.filter((l) => l.flag).length;
    const unknown = entries.filter((e) => !e).length;
    meta.textContent = `${labName} laboratory · Collected ${longDate(report.collected)} · ${report.patient}`;
    stats.replaceChildren(...[
      h("li", {}, h("b", {}, String(report.lines.length)), " tests"),
      marked ? h("li", { class: "stat-flag" }, h("b", {}, String(marked)), " marked by the lab") : null,
      unknown ? h("li", { class: "stat-unknown" }, h("b", {}, String(unknown)), " not identified") : null,
    ].filter(Boolean));
    list.replaceChildren(...report.lines.map((line, i) => resultRow(line, entries[i])));
    paper.replaceChildren(...paperTable(report, labName));
  };

  for (const radio of document.querySelectorAll("input[name=view]")) {
    radio.addEventListener("change", () => {
      const asPaper = document.querySelector("#view-paper").checked;
      list.hidden = asPaper;
      paper.hidden = !asPaper;
    });
  }

  document.querySelector("#picker").replaceChildren(...reports.flatMap((report, i) => {
    const id = `report-${i}`;
    const input = h("input", { type: "radio", name: "report", id, value: report.id, checked: i === 0 });
    input.addEventListener("change", () => show(report));
    const where = SITE.hospitals[report.hospital]?.name ?? report.hospital;
    return [input, h("label", { for: id }, report.patient.replace("Synthetic patient ", ""), h("span", { class: "count" }, where))];
  }));
  show(reports[0]);
  document.querySelector("#print")?.addEventListener("click", () => window.print());
}

main().catch((error) => {
  console.error(error);
  document.querySelector("#lines").replaceChildren(h("li", { class: "empty" }, "The sample reports could not load. Reload the page to try again."));
});
