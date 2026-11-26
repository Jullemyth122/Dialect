// "My lab report, explained": sample synthetic reports, explained with MedlinePlus text.
// No AI-written health text. Flags are the lab's own; Dialect never computes one.
import { h, loadJson } from "./common.js";
import { SITE } from "./site-config.js";
import { explain } from "./medlineplus.js";

const FLAG_WORDS = { H: "above the lab's range", L: "below the lab's range", HH: "far above the lab's range", LL: "far below the lab's range", A: "abnormal, by the lab's own rules" };
const dateText = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });

function lineItem(line, entry) {
  const titleId = `t-${line.code.replace(/[^a-z0-9]/gi, "_")}`;
  if (!line.loinc || !entry) {
    return h("li", { class: "line is-unknown", "aria-labelledby": titleId },
      h("div", {},
        h("h3", { id: titleId }, line.name),
        h("p", { class: "as-written" }, `Written on the report as ${line.code}`),
        h("p", { class: "about" }, "We couldn't identify this test. Ask the lab or your doctor.")),
      figure(line));
  }
  const about = h("div", { class: "about" }, h("span", { class: "skeleton" }), h("span", { class: "skeleton" }));
  const title = h("h3", { id: titleId }, line.name);
  const item = h("li", { class: "line", "aria-labelledby": titleId },
    h("div", {}, title, h("p", { class: "as-written" }, `Written on the report as ${line.code} · LOINC ${entry.code}`), about),
    figure(line));
  explain(entry.code)
    .then((info) => {
      if (info.title) title.textContent = info.title;
      const parts = [];
      if (info.text) parts.push(h("p", {}, info.text));
      else parts.push(h("p", {}, entry.display));
      parts.push(h("p", { class: "credit" }, info.source === "medlineplus" ? "Source: MedlinePlus, National Library of Medicine. " : "", h("a", { href: info.url }, info.text ? "Read more on MedlinePlus" : "Look this test up on MedlinePlus")));
      about.replaceChildren(...parts);
    })
    .catch(() => {
      about.replaceChildren(
        h("p", {}, entry.display),
        h("p", { class: "credit" }, "The explanation could not load right now. ", h("a", { href: "https://medlineplus.gov/lab-tests/" }, "Browse lab tests on MedlinePlus")));
    });
  return item;
}

function figure(line) {
  return h("div", { class: "line-figure" },
    h("span", { class: "small muted" }, "Your result"),
    h("span", { class: "big" }, String(line.value), " ", h("span", { class: "unit" }, line.unit)),
    h("span", { class: "small" }, `Lab's range: ${line.range || "not given"}`),
    line.flag
      ? h("span", { class: "small" }, h("span", { class: "flag" }, line.flag), ` The lab marked this ${FLAG_WORDS[line.flag] ?? "with its own flag"}.`)
      : h("span", { class: "small muted" }, "No mark from the lab."));
}

async function main() {
  const [{ reports }, subset] = await Promise.all([loadJson("/data/reports.json"), loadJson("/data/loinc-subset.json")]);
  const byCode = new Map(subset.codes.map((c) => [c.code, c]));
  const picker = document.querySelector("#picker");
  const list = document.querySelector("#lines");
  const show = (report) => {
    list.replaceChildren(...report.lines.map((line) => lineItem(line, line.loinc ? byCode.get(line.loinc) : null)));
  };
  picker.replaceChildren(...reports.flatMap((report, i) => {
    const id = `report-${i}`;
    const hospital = SITE.hospitals[report.hospital];
    const input = h("input", { type: "radio", name: "report", id, value: report.id, checked: i === 0 });
    input.addEventListener("change", () => show(report));
    return [input, h("label", { for: id }, h("strong", {}, report.patient), h("span", { class: "small muted" }, `${hospital?.name ?? report.hospital} · ${dateText(report.collected)} · ${report.lines.length} tests`))];
  }));
  show(reports[0]);
  document.querySelector("#print")?.addEventListener("click", () => window.print());
}

main().catch((error) => {
  console.error(error);
  document.querySelector("#lines").replaceChildren(h("li", { class: "empty" }, "The sample reports could not load. Reload the page to try again."));
});
