// Doctor and nurse view: a referred patient's results lined up by LOINC code, oldest
// first. The referring lab's values are converted to the receiving hospital's units only
// with a cited factor (conversions.json). Unmatched tests are kept apart.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { convert, formatValue } from "../lib/units.js";

const LABELS = {
  glucose_fasting: "Glucose, fasting", glucose: "Glucose", creatinine: "Creatinine", potassium: "Potassium",
  sodium: "Sodium", cholesterol_total: "Cholesterol, total", hemoglobin: "Hemoglobin",
};
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

function cell(line, label, targetUnit, table, analyte, receivingName) {
  if (!line) return h("td", { "data-label": label }, h("span", { class: "sub" }, "Not tested"));
  const converted = targetUnit && targetUnit !== line.unit ? convert(table, analyte, line.value, line.unit, targetUnit) : null;
  return h("td", { "data-label": label },
    h("span", { class: "val" }, String(line.value)), " ", h("span", { class: "unit" }, line.unit),
    line.flag ? [" ", h("span", { class: "flag", title: "The lab's own flag" }, line.flag)] : null,
    converted ? h("span", { class: "conv" }, `≈ ${formatValue(converted.value)} ${targetUnit} in ${receivingName}'s units`) : null,
    targetUnit && targetUnit !== line.unit && !converted ? h("span", { class: "sub" }, "Different unit, shown as reported") : null,
    h("span", { class: "sub" }, `Range ${line.range || "not given"} · ${line.code}`));
}

async function main() {
  const [packet, subset, table] = await Promise.all([
    loadJson("/data/referral-SYN-000123.json"), loadJson("/data/loinc-subset.json"), loadJson("/data/conversions.json"),
  ]);
  const name = (id) => SITE.hospitals[id]?.name ?? id;
  const fromId = packet.referral.from;
  const toId = packet.referral.to;
  const blocks = [[fromId, packet.results[fromId]], [toId, packet.results[toId]]].sort((a, b) => a[1].collected.localeCompare(b[1].collected));
  const [[oldId, oldBlock], [newId, newBlock]] = blocks;
  const byCode = new Map(subset.codes.map((c) => [c.code, c]));

  document.querySelector("#patient").replaceChildren(
    h("span", { class: "who" }, packet.patient.id),
    h("span", { class: "meta" }, `Referred from ${name(fromId)} to ${name(toId)} · ${shortDate(packet.referral.date)}`),
    h("span", { class: "badge badge-muted" }, "Synthetic patient"));

  const oldLabel = `Earlier · ${name(oldId)} · ${shortDate(oldBlock.collected)}`;
  const newLabel = `Latest · ${name(newId)} · ${shortDate(newBlock.collected)}`;
  document.querySelector("#col-old").textContent = oldLabel;
  document.querySelector("#col-new").textContent = newLabel;

  const groups = new Map();
  for (const [side, block] of [["old", oldBlock], ["new", newBlock]]) {
    for (const line of block.lines) {
      const entry = line.loinc ? byCode.get(line.loinc) : null;
      if (!entry) continue;
      const g = groups.get(entry.analyte) ?? { analyte: entry.analyte, codes: new Set() };
      g.codes.add(entry.code);
      g[side] = line;
      groups.set(entry.analyte, g);
    }
  }
  // Convert the referring hospital's values into the receiving hospital's units.
  const receivingSide = oldId === toId ? "old" : "new";
  document.querySelector("#lined tbody").replaceChildren(...[...groups.values()].map((g) => {
    const target = g[receivingSide]?.unit;
    return h("tr", {},
      h("th", { scope: "row" }, LABELS[g.analyte] ?? g.analyte, h("span", { class: "code" }, `LOINC ${[...g.codes].join(" · ")}`)),
      cell(g.old, oldLabel, receivingSide === "old" ? null : target, table, g.analyte, name(toId)),
      cell(g.new, newLabel, receivingSide === "new" ? null : target, table, g.analyte, name(toId)));
  }));

  const unmatched = [...oldBlock.lines, ...newBlock.lines].filter((l) => !l.loinc || !byCode.has(l.loinc));
  document.querySelector("#unmatched").replaceChildren(...(unmatched.length
    ? unmatched.map((l) => h("li", {}, h("strong", { class: "mono" }, l.code), h("span", {}, l.name), h("span", { class: "muted" }, `${l.value} ${l.unit}`.trim())))
    : [h("li", {}, "Every test was matched.")]));

  document.querySelector("#conversion-source").replaceChildren(
    "Only these factors are used: ", h("a", { href: table.source.url }, table.source.title), ` (checked ${table.source.checked}). `,
    "Everything else is shown exactly as the lab reported it. Flags (like H) are the labs' own.");
  document.querySelector("#print")?.addEventListener("click", () => window.print());
}

main().catch((error) => {
  console.error(error);
  document.querySelector("#patient").replaceChildren(h("span", {}, "The referral could not load. Reload the page to try again."));
});
