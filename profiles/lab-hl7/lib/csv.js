// Minimal CSV reading and writing (RFC 4180 quoting). No dependencies.

/**
 * Parse CSV text into objects keyed by the header row.
 * @param {string} text
 * @returns {Array<Record<string,string>>}
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const input = String(text ?? "").replace(/^﻿/, "");
  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field); field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((values) => Object.fromEntries(header.map((h, i) => [h, (values[i] ?? "").trim()])));
}

/**
 * Write objects as CSV with the given columns.
 * @param {Array<Record<string, unknown>>} items
 * @param {string[]} columns
 * @returns {string}
 */
export function toCsv(items, columns) {
  const cell = (v) => {
    const s = String(v ?? "");
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.join(","), ...items.map((it) => columns.map((c) => cell(it[c])).join(","))].join("\r\n") + "\r\n";
}
