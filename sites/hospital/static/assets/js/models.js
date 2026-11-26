// Model chooser. Saves setups with the runtime's own storage (runtime/byok.js), so the
// assistant's "AI model settings" panel and this page share them. The runtime is not edited.
import { h, announce } from "./common.js";
import { SITE } from "./site-config.js";
import { loadByokStore, getSelectedByokProfile, upsertByokProfile, deleteByokProfile } from "../../runtime/byok.js";

const META_ROUTER = "https://api.meta.ai/v1";
const META_KEYS = "https://dev.meta.ai/";
// Prices: https://dev.meta.ai/docs/pricing-rate-limits, Standard mode, checked 2026-11-26.
const META_MODELS = [
  { id: "muse-ember-1.0", name: "Muse Ember", tag: "Cheapest", note: "Made for high-volume tool calls. This site's default.", price: "$0.10 in · $0.50 out" },
  { id: "muse-spark-1.3", name: "Muse Spark 1.3", tag: "Newest Spark", note: "Meta's model for agentic work at scale.", price: "$1.25 in · $4.25 out" },
  { id: "muse-wonder-1.0", name: "Muse Wonder", tag: "Most capable", note: "Meta's most capable model; the most expensive.", price: "$4.00 in · $20.00 out" },
  { id: "muse-spark-1.2", name: "Muse Spark 1.2", tag: "Earlier Spark", note: "Previous Spark version.", price: "$1.25 in · $4.25 out" },
  { id: "muse-spark-1.1", name: "Muse Spark 1.1", tag: "Earlier Spark", note: "Older Spark version.", price: "$1.25 in · $4.25 out" },
];

const els = {
  meta: document.querySelector("#meta-models"),
  provider: document.querySelector("#provider"),
  router: document.querySelector("#router"),
  model: document.querySelector("#model"),
  key: document.querySelector("#key"),
  keyLink: document.querySelector("#key-link"),
  form: document.querySelector("#model-form"),
  current: document.querySelector("#current"),
};

async function providers() {
  const list = [{ name: "Meta Model API", router: META_ROUTER, model: SITE.defaultModel, keyUrl: META_KEYS }];
  try {
    const { API_KEY_PROVIDERS } = await import("../../runtime/ui.js");
    for (const p of API_KEY_PROVIDERS) {
      if (p.router && p.model && !list.some((q) => q.router === p.router)) list.push({ name: p.name, router: p.router, model: p.model, keyUrl: p.keyUrl });
    }
  } catch (error) {
    console.warn("Could not read the runtime's provider list", error);
  }
  list.push({ name: "Other (OpenAI-compatible)", router: "", model: "", keyUrl: "" });
  return list;
}

function setKeyLink(url) {
  els.keyLink.replaceChildren(url ? h("a", { href: url, rel: "noopener" }, "Get a key from this provider") : "");
}

function showCurrent() {
  const profile = getSelectedByokProfile(loadByokStore());
  if (!profile) {
    els.current.textContent = SITE.publisherFunded
      ? `This site's default: ${SITE.defaultModel}, paid for by this site. No key needed.`
      : `No setup saved. The assistant will ask for a key for ${SITE.defaultModel} (Meta Model API).`;
    return;
  }
  let host = profile.router;
  try { host = new URL(profile.router).host; } catch { /* keep as typed */ }
  els.current.textContent = `${profile.name}: model ${profile.model || "(none)"} at ${host || "(no address)"}, key ${profile.key ? "saved in this browser" : "not set"}.`;
}

async function main() {
  els.meta.replaceChildren(...META_MODELS.map((m, i) => {
    const id = `meta-${i}`;
    const input = h("input", { type: "radio", name: "meta-model", id, value: m.id, checked: m.id === SITE.defaultModel });
    input.addEventListener("change", () => {
      els.provider.value = "Meta Model API";
      els.router.value = META_ROUTER;
      els.model.value = m.id;
      setKeyLink(META_KEYS);
    });
    return h("div", { class: "model" }, input, h("label", { for: id },
      h("span", { class: "tag" }, m.tag),
      h("span", { class: "model-name" }, m.name),
      h("span", { class: "model-id" }, m.id),
      h("span", {}, m.note),
      h("span", { class: "price" }, `${m.price} per 1M tokens`)));
  }));

  const list = await providers();
  els.provider.replaceChildren(...list.map((p) => h("option", { value: p.name }, p.name)));
  const apply = (name) => {
    const p = list.find((q) => q.name === name);
    if (!p) return;
    els.router.value = p.router;
    els.model.value = p.model;
    setKeyLink(p.keyUrl);
    for (const radio of document.querySelectorAll("input[name=meta-model]")) radio.checked = p.name === "Meta Model API" && radio.value === p.model;
  };
  els.provider.addEventListener("change", () => apply(els.provider.value));
  apply("Meta Model API");

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const router = els.router.value.trim();
    const model = els.model.value.trim();
    const key = els.key.value.trim();
    let problem = "";
    try { if (new URL(router).protocol !== "https:" && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(new URL(router).hostname)) problem = "The provider address must start with https://."; } catch { problem = "Enter the provider address, such as https://api.meta.ai/v1."; }
    if (!problem && !model) problem = "Enter a model name.";
    if (!problem && /-contributor$/.test(model)) problem = "Contributor models let the provider train on what you send. Choose a Standard model.";
    if (!problem && !key) problem = "Enter your API key.";
    if (problem) { announce("#form-status", problem); return; }
    upsertByokProfile({ name: `${els.provider.value} · ${model}`.slice(0, 80), router, model, key }, { select: true });
    els.key.value = "";
    showCurrent();
    announce("#form-status", `Saved. The assistant on the workbench now uses ${model}. Reload the workbench if it is already open.`);
  });

  document.querySelector("#delete-all").addEventListener("click", () => {
    for (const profile of loadByokStore().profiles) deleteByokProfile(profile.id);
    showCurrent();
    announce("#current", "All saved setups were deleted from this browser. Close the tab to stop any open chat from using a key.");
  });

  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) document.querySelector("#loopback-note").hidden = false;
  showCurrent();
}

main().catch((error) => {
  console.error(error);
  announce("#form-status", "The model settings could not load. Reload the page to try again.");
});
