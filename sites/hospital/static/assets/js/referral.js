// Doctor and nurse view: a referred patient's results lined up by LOINC code, oldest
// first, laid out like a clinical results flowsheet. The referring lab's values are
// converted to the receiving hospital's units only with a cited factor (conversions.json).
// Flags are each lab's own. Unmatched tests are kept apart.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { convert, formatValue } from "../lib/units.js";
import { plainName } from "./plain-names.js";

const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

function cell(line, label, targetUnit, table, analyte) {
  if (!line) return h("td", { "data-label": label, class: "is-empty" }, h("span", { class: "sub" }, "Not tested"));
  const needsConversion = Boolean(targetUnit && targetUnit !== line.unit);
  const converted = needsConversion ? convert(table, analyte, line.value, line.unit, targetUnit) : null;
  const flag = line.flag ? h("span", { class: "flag", title: "The lab's own mark" }, line.flag) : null;
  if (converted) {
    return h("td", { "data-label": label },
      h("div", { class: "cell-main" }, h("span", { class: "val" }, formatValue(converted.value)), h("span", { class: "unit" }, targetUnit), flag, h("span", { class: "conv-tag" }, "converted")),
      h("span", { class: "sub" }, `As reported: ${line.value} ${line.unit} · range ${line.range || "not given"} · code ${line.code}`));
  }
  return h("td", { "data-label": label },
    h("div", { class: "cell-main" }, h("span", { class: "val" }, String(line.value)), h("span", { class: "unit" }, line.unit), flag),
    needsConversion ? h("span", { class: "sub sub-warn" }, "Different unit, no cited factor: shown as reported") : null,
    h("span", { class: "sub" }, `Range ${line.range || "not given"} · code ${line.code}`));
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
    h("span", { class: "avatar", "aria-hidden": "true" }, "SP"),
    h("div", { class: "who-wrap" },
      h("span", { class: "who" }, "SYNTHETIC, Patient"),
      h("span", { class: "ids" }, `MRN ${packet.patient.id} · Synthetic patient, not a real person`)),
    h("dl", { class: "banner-facts" },
      h("div", {}, h("dt", {}, "Referred from"), h("dd", {}, name(fromId))),
      h("div", {}, h("dt", {}, "To"), h("dd", {}, name(toId))),
      h("div", {}, h("dt", {}, "Date"), h("dd", {}, shortDate(packet.referral.date)))));

  const oldLabel = `${name(oldId)} · ${shortDate(oldBlock.collected)}`;
  const newLabel = `${name(newId)} · ${shortDate(newBlock.collected)}`;
  const head = (el, when, label, here) => el.replaceChildren(
    h("span", { class: "col-when" }, when), h("span", { class: "col-where" }, label), here ? h("span", { class: "col-here" }, "your hospital") : null);
  head(document.querySelector("#col-old"), "Earlier", oldLabel, oldId === toId);
  head(document.querySelector("#col-new"), "Latest", newLabel, newId === toId);

  const groups = new Map();
  for (const [side, block] of [["old", oldBlock], ["new", newBlock]]) {
    for (const line of block.lines) {
      const entry = line.loinc ? byCode.get(line.loinc) : null;
      if (!entry) continue;
      const g = groups.get(entry.analyte) ?? { analyte: entry.analyte, entries: [] };
      if (!g.entries.some((e) => e.code === entry.code)) g.entries.push(entry);
      g[side] = line;
      groups.set(entry.analyte, g);
    }
  }
  // Convert the referring hospital's values into the receiving hospital's units.
  const receivingSide = oldId === toId ? "old" : "new";
  const rows = [...groups.values()];
  document.querySelector("#lined tbody").replaceChildren(...rows.map((g) => {
    const target = g[receivingSide]?.unit;
    return h("tr", {},
      h("th", { scope: "row" }, plainName(g.entries[0]), h("span", { class: "code" }, `LOINC ${g.entries.map((e) => e.code).join(" · ")}`)),
      cell(g.old, `Earlier · ${oldLabel}`, receivingSide === "old" ? null : target, table, g.analyte),
      cell(g.new, `Latest · ${newLabel}`, receivingSide === "new" ? null : target, table, g.analyte));
  }));

  const unmatched = [...oldBlock.lines, ...newBlock.lines].filter((l) => !l.loinc || !byCode.has(l.loinc));
  document.querySelector("#lined-sub").textContent = `${rows.length} tests lined up · ${unmatched.length} kept apart · oldest on the left`;
  document.querySelector("#unmatched").replaceChildren(...(unmatched.length
    ? unmatched.map((l) => h("li", {}, h("code", {}, l.code), h("span", {}, l.name), h("span", { class: "muted" }, `${l.value} ${l.unit}`.trim())))
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
