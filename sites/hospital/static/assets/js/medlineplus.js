// MedlinePlus Connect by LOINC code. Sends only the LOINC code (a public code).
// Public-domain "Medical test information" is shown as text with credit; A.D.A.M.
// encyclopedia pages (copyrighted, under /ency/) are linked, never copied.
// Cached 24 hours, as NLM asks; well under the 100 requests a minute limit.

const ENDPOINT = "https://connect.medlineplus.gov/service";
const LOINC_OID = "2.16.840.1.113883.6.1";
const CACHE_KEY = "dialect:medlineplus:v1";
const DAY = 24 * 60 * 60 * 1000;

function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}
function writeCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage full or blocked */ }
}

/** Plain text of the first paragraphs, without any HTML from the response. */
function summaryText(html, maxChars = 520) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const paragraphs = [...doc.querySelectorAll("p")].map((p) => p.textContent.replace(/\s+/g, " ").trim()).filter(Boolean);
  let text = "";
  for (const p of paragraphs) {
    if (text && text.length + p.length > maxChars) break;
    text = text ? `${text} ${p}` : p;
  }
  return text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text;
}

/**
 * @param {string} loinc
 * @returns {Promise<{title:string, text:string|null, url:string, source:"medlineplus"|"none"}>}
 */
export async function explain(loinc) {
  const cache = readCache();
  const hit = cache[loinc];
  if (hit && Date.now() - hit.at < DAY) return hit.value;
  const url = `${ENDPOINT}?mainSearchCriteria.v.cs=${LOINC_OID}&mainSearchCriteria.v.c=${encodeURIComponent(loinc)}&knowledgeResponseType=application/json&informationRecipient.languageCode.c=en`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`MedlinePlus: HTTP ${response.status}`);
  const data = await response.json();
  const entry = data?.feed?.entry?.[0];
  let value;
  if (!entry) {
    value = { title: "", text: null, url: `https://medlineplus.gov/lab-tests/`, source: "none" };
  } else {
    const link = (entry.link ?? []).find((l) => l.href)?.href ?? "https://medlineplus.gov/";
    const copyrighted = /\/ency\//.test(link);
    value = {
      title: entry.title?._value ?? "",
      text: copyrighted ? null : summaryText(entry.summary?._value ?? ""),
      url: link,
      source: "medlineplus",
    };
  }
  cache[loinc] = { at: Date.now(), value };
  writeCache(cache);
  return value;
}
