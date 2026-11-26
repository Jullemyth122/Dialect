// Plain-code shortlist of LOINC candidates for one local test. No AI here: the AI only
// picks from this list or says "please check", and the unit check runs again after it.
import { unitFit } from "./units.js";

/**
 * Split a test name or code into lowercase words.
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/**
 * Score how well a local test matches one analyte's synonyms (0 to 1).
 * @param {string} haystack local code and name, lowercased
 * @param {string[]} words tokens of haystack
 * @param {string[]} synonyms
 * @returns {number}
 */
function synonymScore(haystack, words, synonyms) {
  let best = 0;
  for (const synonym of synonyms) {
    const s = synonym.toLowerCase();
    const sWords = tokenize(s);
    if (!sWords.length) continue;
    if (` ${haystack} `.includes(` ${s} `) || words.join(" ") === sWords.join(" ")) {
      best = Math.max(best, 0.6 + 0.1 * Math.min(sWords.length, 4));
      continue;
    }
    const hits = sWords.filter((w) => words.includes(w)).length;
    best = Math.max(best, (hits / sWords.length) * 0.6);
  }
  return Math.min(best, 1);
}

/**
 * Shortlist LOINC codes for a local test, best first.
 * @param {{code:string, name:string, unit:string}} test
 * @param {{codes:Array<object>, synonyms:Record<string,string[]>}} subset
 * @param {{limit?: number}} [options]
 * @returns {Array<{code:string, display:string, analyte:string, score:number, unit:"fits"|"clash"|"unknown", reason:string}>}
 */
export function shortlist(test, subset, { limit = 3 } = {}) {
  const haystack = tokenize(`${test.code} ${test.name}`).join(" ");
  const words = haystack.split(" ");
  const fasting = /\bfast|\bfbs\b|-f\b|glu-?f\b/i.test(`${test.code} ${test.name}`);
  const scored = [];
  for (const entry of subset.codes) {
    let score = synonymScore(haystack, words, subset.synonyms[entry.analyte] ?? []);
    if (score === 0) continue;
    // Fasting is part of the meaning: prefer fasting codes only when the name says so.
    if (entry.analyte === "glucose_fasting") score += fasting ? 0.15 : -0.2;
    if (entry.analyte === "glucose" && fasting) score -= 0.15;
    const unit = unitFit(entry, test.unit);
    if (unit === "clash") score -= 0.5;
    if (unit === "fits") score += 0.1;
    const reason = [
      `name matches "${entry.analyte.replace(/_/g, " ")}"`,
      unit === "fits" ? `unit ${test.unit} fits` : unit === "clash" ? `unit ${test.unit} does not fit` : "unit missing or unknown",
    ].join("; ");
    scored.push({ code: entry.code, display: entry.display, analyte: entry.analyte, score: Math.max(0, Math.round(score * 100) / 100), unit, reason });
  }
  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.code.localeCompare(b.code))
    .slice(0, limit);
}

/**
 * The plain-code check that every AI suggestion must pass before it is shown as confident.
 * @param {{code:string, name:string, unit:string}} test
 * @param {string} loinc
 * @param {{codes:Array<object>}} subset
 * @returns {{ok: true} | {ok: false, reason: string}}
 */
export function checkSuggestion(test, loinc, subset) {
  const entry = subset.codes.find((c) => c.code === loinc);
  if (!entry) return { ok: false, reason: `${loinc} is not in this site's LOINC list.` };
  const unit = unitFit(entry, test.unit);
  if (unit === "clash") return { ok: false, reason: `Unit ${test.unit} does not fit ${loinc} (${entry.display}).` };
  if (unit === "unknown") return { ok: false, reason: `The unit is missing or unknown, so ${loinc} cannot be confirmed by the unit check.` };
  return { ok: true };
}
