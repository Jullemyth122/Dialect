import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { judge, scoreRun, bootstrapDiff, POINTS } from "../lib/scorer.js";
import { normalizeUnit, unitProperty, unitFit, convert, formatValue } from "../lib/units.js";
import { shortlist, checkSuggestion, tokenize } from "../lib/candidates.js";
import { parseCsv, toCsv } from "../lib/csv.js";
import { toConceptMap } from "../lib/conceptmap.js";

const subset = JSON.parse(readFileSync(new URL("../loinc-subset.json", import.meta.url)));
const conversions = JSON.parse(readFileSync(new URL("../conversions.json", import.meta.url)));

test("scorer: +1 correct, 0 please check, -5 confident and wrong", () => {
  assert.deepEqual(POINTS, { correct: 1, abstain: 0, wrong: -5 });
  assert.equal(judge({ loinc: "14771-0" }, "14771-0"), "correct");
  assert.equal(judge({ loinc: "1558-6" }, "14771-0"), "wrong");
  assert.equal(judge({ loinc: null, abstain: true }, "14771-0"), "abstain");
  assert.equal(judge({ loinc: "1558-6", abstain: true }, "14771-0"), "abstain");
  // No right code exists: any confident answer is wrong; asking is safe.
  assert.equal(judge({ loinc: "2345-7" }, null), "wrong");
  assert.equal(judge({ abstain: true }, null), "abstain");
});

test("scorer: a run's totals and rates", () => {
  const truths = { a: "1", b: "2", c: "3", d: null };
  const run = scoreRun(
    [{ id: "a", loinc: "1" }, { id: "b", loinc: "9" }, { id: "c", abstain: true }, { id: "d", abstain: true }],
    truths,
  );
  assert.equal(run.n, 4);
  assert.equal(run.correct, 1);
  assert.equal(run.wrong, 1);
  assert.equal(run.abstain, 2);
  assert.equal(run.points, -4);
  assert.equal(run.mean, -1);
  assert.equal(run.wrongPer100, 25);
  assert.deepEqual(run.perItem, [1, -5, 0, 0]);
  assert.throws(() => scoreRun([{ id: "zzz", loinc: "1" }], truths), /No known answer/);
});

test("bootstrap: repeatable, and the interval contains the observed difference", () => {
  const a = [1, 1, 1, 0, 1, 1, 0, 1, 1, 1];
  const b = [1, -5, 1, 0, 1, -5, 0, 1, 1, 0];
  const first = bootstrapDiff(a, b, { iterations: 500, seed: 7 });
  const second = bootstrapDiff(a, b, { iterations: 500, seed: 7 });
  assert.deepEqual(first, second);
  assert.ok(first.lo <= first.diff && first.diff <= first.hi);
  assert.ok(first.diff > 0);
  assert.throws(() => bootstrapDiff([1], [1, 2]));
});

test("units: normalizing, kinds and fit", () => {
  assert.equal(normalizeUnit(" µmol/L "), "umol/l");
  assert.equal(unitProperty("mg/dL"), "mass");
  assert.equal(unitProperty("mmol/L"), "moles");
  assert.equal(unitProperty("furlongs"), null);
  const fastingMass = subset.codes.find((c) => c.code === "1558-6");
  assert.equal(unitFit(fastingMass, "mg/dL"), "fits");
  assert.equal(unitFit(fastingMass, "mmol/L"), "clash");
  assert.equal(unitFit(fastingMass, ""), "unknown");
});

test("conversions: only cited factors, never invented ones", () => {
  const glucose = convert(conversions, "glucose_fasting", 5.6, "mmol/L", "mg/dL");
  assert.equal(formatValue(glucose.value), "100.9");
  assert.equal(glucose.factor, 18.02);
  const creatinine = convert(conversions, "creatinine", 88, "µmol/L", "mg/dL");
  assert.equal(formatValue(creatinine.value), "0.99");
  assert.equal(convert(conversions, "potassium", 4, "mmol/L", "mEq/L"), null);
  assert.equal(convert(conversions, "hemoglobin", 14, "g/dL", "g/dL").factor, 1);
  for (const c of conversions.conversions) assert.ok(c.factor > 0 && c.row, "every factor has a source row");
});

test("LOINC subset: unique codes, every analyte has synonyms", () => {
  const codes = subset.codes.map((c) => c.code);
  assert.equal(new Set(codes).size, codes.length);
  for (const c of subset.codes) {
    assert.match(c.code, /^\d{1,7}-\d$/);
    assert.ok(subset.synonyms[c.analyte]?.length, `synonyms for ${c.analyte}`);
  }
});

test("shortlist: the unit decides between look-alike codes", () => {
  const top = (test) => shortlist(test, subset)[0]?.code;
  assert.equal(top({ code: "GLU-F", name: "Fasting Glucose", unit: "mmol/L" }), "14771-0");
  assert.equal(top({ code: "GLUF", name: "Glucose, Fasting", unit: "mg/dL" }), "1558-6");
  assert.equal(top({ code: "SGPT", name: "SGPT/ALT", unit: "U/L" }), "1742-6");
  assert.equal(top({ code: "CREA", name: "Creat", unit: "umol/L" }), "14682-9");
  assert.deepEqual(shortlist({ code: "XLAB-77", name: "Special chem panel 3", unit: "" }, subset), []);
  assert.deepEqual(tokenize("K+ (serum)"), ["k+", "serum"]);
});

test("unit check refuses a clash and an unknown unit", () => {
  const glu = { code: "GLU-F", name: "Fasting Glucose", unit: "mmol/L" };
  assert.deepEqual(checkSuggestion(glu, "14771-0", subset), { ok: true });
  assert.equal(checkSuggestion(glu, "1558-6", subset).ok, false);
  assert.equal(checkSuggestion({ ...glu, unit: "" }, "14771-0", subset).ok, false);
  assert.equal(checkSuggestion(glu, "9999-9", subset).ok, false);
});

test("csv round trip with quotes and commas", () => {
  const rows = [{ code: "GLUF", name: 'Glucose, "Fasting"', unit: "mg/dL" }];
  const text = toCsv(rows, ["code", "name", "unit"]);
  assert.deepEqual(parseCsv(text), rows);
});

test("ConceptMap: valid FHIR R4 shape, marked draft and experimental", () => {
  const map = toConceptMap(
    { id: "hospital-b", name: "Hospital B", siteUrl: "https://example.org/", codeSystem: "urn:dialect:hospital-b:lab" },
    [{ code: "GLU-F", name: "Fasting Glucose", loinc: "14771-0", display: "Fasting glucose [Moles/volume] in Serum or Plasma" }],
    new Date("2026-11-26T00:00:00Z"),
  );
  assert.equal(map.resourceType, "ConceptMap");
  assert.equal(map.status, "draft");
  assert.equal(map.experimental, true);
  assert.equal(map.group[0].target, "http://loinc.org");
  assert.equal(map.group[0].element[0].target[0].code, "14771-0");
});
