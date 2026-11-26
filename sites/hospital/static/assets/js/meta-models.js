// Meta Model API facts shared by the AI model page and the lab page's AI card.
// Prices: https://dev.meta.ai/docs/pricing-rate-limits, Standard mode, checked 2026-11-26.
// Never list "-contributor" models: Meta may train on what they receive.
export const META_ROUTER = "https://api.meta.ai/v1";
export const META_KEYS = "https://dev.meta.ai/";
export const META_MODELS = [
  { id: "muse-ember-1.0", name: "Muse Ember", tag: "Cheapest", note: "Fast and low-cost. This site's default.", price: "$0.10 in · $0.50 out" },
  { id: "muse-spark-1.3", name: "Muse Spark 1.3", tag: "Newest Spark", note: "Newer and smarter; costs more.", price: "$1.25 in · $4.25 out" },
  { id: "muse-wonder-1.0", name: "Muse Wonder", tag: "Most capable", note: "Best answers; highest price.", price: "$4.00 in · $20.00 out" },
  { id: "muse-spark-1.2", name: "Muse Spark 1.2", tag: "Earlier Spark", note: "Previous Spark version.", price: "$1.25 in · $4.25 out" },
  { id: "muse-spark-1.1", name: "Muse Spark 1.1", tag: "Earlier Spark", note: "Older Spark version.", price: "$1.25 in · $4.25 out" },
];
