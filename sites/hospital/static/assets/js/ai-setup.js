// The lab page's "AI helper" card: shows whether the AI is connected and lets lab staff
// paste a Meta API key right there. The key is stored with the runtime's own BYOK storage
// (runtime/byok.js), in this browser only, and is never logged, put in a URL or sent
// anywhere except the chosen provider by the runtime. Patients' pages never load this.
import { h, announce } from "./common.js";
import { SITE } from "./site-config.js";
import { META_ROUTER, META_MODELS } from "./meta-models.js";
import { loadByokStore, getSelectedByokProfile, upsertByokProfile, deleteByokProfile } from "../../runtime/byok.js";

const $ = (s) => document.querySelector(s);

function current() {
  try { return getSelectedByokProfile(loadByokStore()); } catch { return null; }
}

function show() {
  const profile = current();
  const connected = Boolean(profile?.key) || SITE.publisherFunded;
  $("#ai-card").classList.toggle("is-on", connected);
  if (connected) {
    let host = profile?.router ?? "";
    try { host = new URL(host).host; } catch { /* keep as saved */ }
    $("#ai-title").textContent = "AI helper: connected";
    $("#ai-sub").textContent = profile?.key
      ? `Using ${profile.model} (${host}). Your key is saved in this browser only.`
      : `Using ${SITE.defaultModel}, paid for by this site.`;
  } else {
    $("#ai-title").textContent = "AI helper: not connected";
    $("#ai-sub").textContent = "Optional. Without AI you get name matches only. Add a Meta API key to get AI suggestions. Only lab staff use AI; patients never do.";
  }
  $("#ai-form").hidden = connected;
  $("#ai-change").hidden = !profile?.key;
  $("#ai-remove").hidden = !profile?.key;
  if (profile?.model) $("#ai-model").value = profile.model;
}

function main() {
  if (!$("#ai-card")) return;
  $("#ai-model").replaceChildren(...META_MODELS.map((m) => h("option", { value: m.id }, `${m.name} · ${m.tag} (${m.price} per 1M tokens)`)));
  $("#ai-model").value = SITE.defaultModel;

  $("#ai-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const key = $("#ai-key").value.trim();
    const model = $("#ai-model").value;
    if (!key) { announce("#ai-form-status", "Paste your Meta API key first."); $("#ai-key").focus(); return; }
    if (!META_MODELS.some((m) => m.id === model)) { announce("#ai-form-status", "Choose one of the listed models."); return; }
    upsertByokProfile({ name: `Meta Model API · ${model}`, router: META_ROUTER, model, key }, { select: true });
    $("#ai-key").value = "";
    announce("#ai-form-status", "Connected. Restarting the AI helper with your key…");
    setTimeout(() => location.reload(), 600);
  });

  $("#ai-change").addEventListener("click", () => {
    $("#ai-form").hidden = false;
    $("#ai-key").focus();
  });

  $("#ai-remove").addEventListener("click", () => {
    const profile = current();
    if (profile) deleteByokProfile(profile.id);
    announce("#ai-form-status", "Key removed from this browser. Restarting…");
    setTimeout(() => location.reload(), 600);
  });

  show();
}

/** Bring the card into view and put the cursor in the key field. */
export function focusAiSetup() {
  const card = $("#ai-card");
  if (!card) return;
  $("#ai-form").hidden = false;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => $("#ai-key")?.focus({ preventScroll: true }), 300);
}

if (typeof document !== "undefined") main();
