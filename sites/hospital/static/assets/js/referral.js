// Referral view: lines up a referred patient's results by LOINC code. Only results with a
// LOINC code from their own lab are lined up; conversions use only conversions.json.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { convert, formatValue } from "../lib/units.js";

const ANALYTE_LABELS = {
  glucose_fasting: "Glucose, fasting",
  glucose: "Glucose",
  creatinine: "Creatinine",
  potassium: "Potassium",
  cholesterol_total: "Cholesterol, total",
  hemoglobin: "Hemoglobin",
};

const dateText = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

function flagBadge(flag) {
  return flag ? h("span", { class: "flag", title: "The lab's own flag", "aria-label": `Lab flag ${flag}` }, flag) : null;
}

function valueCell(line, label, convertedTo, table, analyte) {
  if (!line) return h("td", { "data-label": label }, h("span", { class: "cell-sub" }, "No result for this test"));
  const converted = convertedTo && convertedTo !== line.unit ? convert(table, analyte, line.value, line.unit, convertedTo) : null;
  return h("td", { "data-label": label },
    h("span", { class: "value" }, `${line.value} `, h("span", { class: "unit" }, line.unit), " "), flagBadge(line.flag),
    converted ? h("span", { class: "converted" }, `≈ ${formatValue(converted.value)} ${convertedTo} (× ${converted.factor}, cited)`) : null,
    convertedTo && convertedTo !== line.unit && !converted ? h("span", { class: "converted" }, "Different unit; no cited conversion, shown as reported") : null,
    h("span", { class: "cell-sub" }, `Lab range ${line.range || "not given"} · ${line.code} ${line.name}`));
}

async function main() {
  const [packet, subset, table] = await Promise.all([
    loadJson("/data/referral-SYN-000123.json"),
    loadJson("/data/loinc-subset.json"),
    loadJson("/data/conversions.json"),
  ]);
  const fromId = packet.referral.from;
  const toId = packet.referral.to;
  const fromName = SITE.hospitals[fromId]?.name ?? fromId;
  const toName = SITE.hospitals[toId]?.name ?? toId;
  const from = packet.results[fromId];
  const to = packet.results[toId];
  const byCode = new Map(subset.codes.map((c) => [c.code, c]));

  document.querySelector("#patient").replaceChildren(
    h("div", {},
      h("span", { class: "eyebrow" }, "Synthetic patient"),
      h("h2", { id: "patient-title", class: "m-0" }, packet.patient.id)),
    h("dl", {},
      h("div", {}, h("dt", {}, "Referred from"), h("dd", {}, `${fromName} (${SITE.hospitals[fromId]?.kind ?? ""})`)),
      h("div", {}, h("dt", {}, "Referred to"), h("dd", {}, `${toName} (${SITE.hospitals[toId]?.kind ?? ""})`)),
      h("div", {}, h("dt", {}, "Referral date"), h("dd", {}, dateText(packet.referral.date))),
      h("div", {}, h("dt", {}, "Results"), h("dd", {}, `${dateText(from.collected)} and ${dateText(to.collected)}`))));

  document.querySelector("#col-from").textContent = `${fromName} · ${dateText(from.collected)}`;
  document.querySelector("#col-to").textContent = `${toName} · ${dateText(to.collected)}`;

  // Group by analyte: two LOINC codes for the same analyte in different units line up,
  // and the referring value is converted to this hospital's unit only with a cited factor.
  const groups = new Map();
  for (const [side, block] of [["from", from], ["to", to]]) {
    for (const line of block.lines) {
      const entry = line.loinc ? byCode.get(line.loinc) : null;
      if (!entry) continue;
      const group = groups.get(entry.analyte) ?? { analyte: entry.analyte, codes: new Set() };
      group.codes.add(entry.code);
      group[side] = line;
      groups.set(entry.analyte, group);
    }
  }
  const rows = [...groups.values()].map((g) => {
    const codes = [...g.codes].join(" · ");
    const toUnit = g.to?.unit;
    return h("tr", {},
      h("th", { scope: "row" }, h("span", { class: "cell-main" }, ANALYTE_LABELS[g.analyte] ?? g.analyte), h("span", { class: "cell-sub mono" }, `LOINC ${codes}`)),
      valueCell(g.from, `${fromName} · ${dateText(from.collected)}`, toUnit, table, g.analyte),
      valueCell(g.to, `${toName} · ${dateText(to.collected)}`, null, table, g.analyte));
  });
  document.querySelector("#lined tbody").replaceChildren(...rows);

  const unmatched = [...from.lines, ...to.lines].filter((l) => !l.loinc || !byCode.has(l.loinc));
  document.querySelector("#unmatched tbody").replaceChildren(...(unmatched.length
    ? unmatched.map((l) => h("tr", {},
      h("th", { scope: "row" }, h("span", { class: "cell-main mono" }, l.code), h("span", { class: "cell-sub" }, l.name)),
      h("td", { "data-label": "As reported" }, h("span", { class: "value" }, `${l.value} ${l.unit}`), h("span", { class: "cell-sub" }, "Not lined up with any other result"))))
    : [h("tr", {}, h("td", { colspan: "2" }, "Every test was matched."))]));

  document.querySelector("#conversion-source").replaceChildren(
    "Conversions use only the factors in ",
    h("a", { href: table.source.url }, table.source.title),
    ` (checked ${table.source.checked}). Values without a cited factor are shown as reported. Flags are the labs' own.`);

  document.querySelector("#print")?.addEventListener("click", () => window.print());
}

main().catch((error) => {
  console.error(error);
  document.querySelector("#patient").replaceChildren(h("p", {}, "The referral could not load. Reload the page to try again."));
});
