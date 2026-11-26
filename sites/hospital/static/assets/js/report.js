// Patient view: sample synthetic reports as simple cards. Explanations come only from
// MedlinePlus (by LOINC code). Flags are the lab's own; Dialect never computes one.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { explain } from "./medlineplus.js";

const FLAG_WORDS = { H: "Marked high by the lab", L: "Marked low by the lab", HH: "Marked very high by the lab", LL: "Marked very low by the lab", A: "Marked by the lab" };
const shortDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

// Everyday names for the LOINC codes in our subset. The standard LOINC name is shown under it.
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

function testCard(line, entry) {
  const id = `t-${line.code.replace(/[^a-z0-9]/gi, "_")}`;
  const from = h("p", { class: "test-from" }, "Your report says ", h("code", {}, line.code),
    line.name && line.name !== line.code ? h("span", { class: "muted" }, ` "${line.name}"`) : null);
  const name = h("h3", { class: "test-name", id }, entry ? plainName(entry) : "We couldn't identify this test");
  const value = h("div", { class: "test-value" },
    h("span", { class: "num" }, String(line.value)), h("span", { class: "unit" }, line.unit),
    h("span", { class: "range" }, `Lab's range: ${line.range || "not given"}`));
  const main = h("div", { class: "test-main" },
    h("div", {}, from, name, entry ? h("span", { class: "test-paper" }, `Standard name: ${entry.display} · LOINC ${entry.code}`) : null),
    value,
    line.flag ? h("div", { class: "test-flag" }, h("span", { class: "flag" }, `${line.flag} · ${FLAG_WORDS[line.flag] ?? "Marked by the lab"}`)) : null);

  if (!line.loinc || !entry) {
    return h("li", { class: "test is-unknown", "aria-labelledby": id }, main,
      h("p", { class: "about" }, "Dialect won't guess. Ask the lab or your doctor what this test is."));
  }

  const about = h("div", { class: "about" }, h("p", { class: "muted" }, "Loading…"));
  const details = h("details", {}, h("summary", {}, "What is this test?"), about);
  let loaded = false;
  details.addEventListener("toggle", () => {
    if (!details.open || loaded) return;
    loaded = true;
    explain(entry.code)
      .then((info) => {
        about.replaceChildren(
          info.title ? h("p", { class: "about-title" }, info.title) : null,
          h("p", {}, info.text || entry.display),
          h("p", { class: "credit" }, info.source === "medlineplus" ? "Source: MedlinePlus, National Library of Medicine. " : "", h("a", { href: info.url }, "Read more on MedlinePlus")));
      })
      .catch(() => {
        about.replaceChildren(h("p", {}, entry.display), h("p", { class: "credit" }, h("a", { href: "https://medlineplus.gov/lab-tests/" }, "Look it up on MedlinePlus")));
      });
  });
  return h("li", { class: "test", "aria-labelledby": id }, main, details);
}

async function main() {
  const [{ reports }, subset] = await Promise.all([loadJson("/data/reports.json"), loadJson("/data/loinc-subset.json")]);
  const byCode = new Map(subset.codes.map((c) => [c.code, c]));
  const list = document.querySelector("#lines");
  const summary = document.querySelector("#summary");
  const show = (report) => {
    const marked = report.lines.filter((l) => l.flag).length;
    summary.textContent = `${report.patient} · ${shortDate(report.collected)} · ${report.lines.length} tests${marked ? ` · ${marked} marked by the lab` : ""}`;
    list.replaceChildren(...report.lines.map((line) => testCard(line, line.loinc ? byCode.get(line.loinc) : null)));
  };
  document.querySelector("#picker").replaceChildren(...reports.flatMap((report, i) => {
    const id = `report-${i}`;
    const input = h("input", { type: "radio", name: "report", id, value: report.id, checked: i === 0 });
    input.addEventListener("change", () => show(report));
    const where = SITE.hospitals[report.hospital]?.name ?? report.hospital;
    return [input, h("label", { for: id }, `${report.patient.replace("Synthetic patient ", "")}`, h("span", { class: "count" }, where))];
  }));
  show(reports[0]);
  document.querySelector("#print")?.addEventListener("click", () => window.print());
}

main().catch((error) => {
  console.error(error);
  document.querySelector("#lines").replaceChildren(h("li", { class: "empty" }, "The sample reports could not load. Reload the page to try again."));
});
