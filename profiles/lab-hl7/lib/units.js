// Unit rules for the lab profile. Plain code, never AI instructions (CLAUDE.md).
// Conversions use only the cited factors in conversions.json.

const PROPERTY_BY_UNIT = new Map([
  ["mg/dl", "mass"], ["g/dl", "mass"], ["g/l", "mass"],
  ["mmol/l", "moles"], ["umol/l", "moles"], ["meq/l", "moles"],
  ["u/l", "enzyme"], ["iu/l", "enzyme"],
  ["10*3/ul", "count"], ["10^3/ul", "count"], ["x10^9/l", "count"],
  ["%", "fraction"],
]);

/**
 * Normalize a unit string for comparison: trims, lowercases, and writes micro as "u".
 * @param {string} unit
 * @returns {string}
 */
export function normalizeUnit(unit) {
  return String(unit ?? "")
    .trim()
    .replace(/[µμ]/g, "u")
    .replace(/\s+/g, "")
    .toLowerCase();
}

/**
 * The kind of quantity a unit measures, or null when we don't know the unit.
 * @param {string} unit
 * @returns {"mass"|"moles"|"enzyme"|"count"|"fraction"|null}
 */
export function unitProperty(unit) {
  return PROPERTY_BY_UNIT.get(normalizeUnit(unit)) ?? null;
}

/**
 * Whether a reported unit fits a LOINC code from the subset.
 * Unknown or missing units return "unknown", so callers can ask a human.
 * @param {{units: string[], property: string}} entry
 * @param {string} unit
 * @returns {"fits"|"clash"|"unknown"}
 */
export function unitFit(entry, unit) {
  const normalized = normalizeUnit(unit);
  if (!normalized) return "unknown";
  if (entry.units.some((u) => normalizeUnit(u) === normalized)) return "fits";
  const property = unitProperty(unit);
  if (!property) return "unknown";
  return property === entry.property ? "fits" : "clash";
}

/**
 * Convert a value with a cited factor. Returns null when no cited conversion exists,
 * so the caller shows the value as reported instead of computing its own factor.
 * @param {{conversions: Array<{analyte:string, from:string, to:string, factor:number, row:string}>}} table
 * @param {string} analyte
 * @param {number} value
 * @param {string} from
 * @param {string} to
 * @returns {{value:number, factor:number, row:string}|null}
 */
export function convert(table, analyte, value, from, to) {
  if (!Number.isFinite(value)) return null;
  const f = normalizeUnit(from);
  const t = normalizeUnit(to);
  if (f === t) return { value, factor: 1, row: "same unit" };
  const rule = table.conversions.find(
    (c) => c.analyte === analyte && normalizeUnit(c.from) === f && normalizeUnit(c.to) === t,
  );
  if (!rule) return null;
  return { value: value * rule.factor, factor: rule.factor, row: rule.row };
}

/**
 * Round for display without hiding precision: at most one decimal above 10, two below.
 * @param {number} value
 * @returns {string}
 */
export function formatValue(value) {
  if (!Number.isFinite(value)) return "";
  const digits = Math.abs(value) >= 10 ? 1 : 2;
  return String(Number(value.toFixed(digits)));
}
