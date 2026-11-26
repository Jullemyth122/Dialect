// The abstain-aware scorer: +1 correct, 0 "please check", -5 confident and wrong.
// Used by every contender in the four-way comparison (PLAN.md section 7).

export const POINTS = Object.freeze({ correct: 1, abstain: 0, wrong: -5 });

/**
 * Score one answer. `truth` is the right LOINC code, or null when no code in the list
 * is right (then only "please check" avoids the penalty).
 * @param {{loinc: string|null, abstain?: boolean}} prediction
 * @param {string|null} truth
 * @returns {"correct"|"abstain"|"wrong"}
 */
export function judge(prediction, truth) {
  if (!prediction || prediction.abstain || !prediction.loinc) return "abstain";
  return prediction.loinc === truth ? "correct" : "wrong";
}

/**
 * Score a whole run.
 * @param {Array<{id:string, loinc:string|null, abstain?:boolean}>} predictions
 * @param {Record<string, string|null>} truths keyed by id
 * @returns {{n:number, correct:number, abstain:number, wrong:number, points:number, mean:number, accuracy:number, abstainRate:number, wrongPer100:number, perItem:number[]}}
 */
export function scoreRun(predictions, truths) {
  const perItem = [];
  const counts = { correct: 0, abstain: 0, wrong: 0 };
  for (const p of predictions) {
    if (!Object.hasOwn(truths, p.id)) throw new Error(`No known answer for ${p.id}`);
    const verdict = judge(p, truths[p.id]);
    counts[verdict] += 1;
    perItem.push(POINTS[verdict]);
  }
  const n = predictions.length;
  const points = perItem.reduce((a, b) => a + b, 0);
  return {
    n,
    ...counts,
    points,
    mean: n ? points / n : 0,
    accuracy: n ? counts.correct / n : 0,
    abstainRate: n ? counts.abstain / n : 0,
    wrongPer100: n ? (counts.wrong / n) * 100 : 0,
    perItem,
  };
}

/**
 * A small seeded random number generator (mulberry32), so bootstrap results repeat.
 * @param {number} seed
 * @returns {() => number}
 */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Paired bootstrap of the mean-score difference (A minus B) over the same items.
 * Kill rule 1b needs the 95% interval to sit above zero.
 * @param {number[]} a per-item points for contender A
 * @param {number[]} b per-item points for contender B, same items in the same order
 * @param {{iterations?: number, seed?: number}} [options]
 * @returns {{diff:number, lo:number, hi:number}}
 */
export function bootstrapDiff(a, b, { iterations = 2000, seed = 42 } = {}) {
  if (a.length !== b.length || a.length === 0) throw new Error("Need two equal, non-empty lists");
  const n = a.length;
  const diffs = a.map((x, i) => x - b[i]);
  const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const random = seededRandom(seed);
  const samples = [];
  for (let k = 0; k < iterations; k += 1) {
    let sum = 0;
    for (let i = 0; i < n; i += 1) sum += diffs[Math.floor(random() * n)];
    samples.push(sum / n);
  }
  samples.sort((x, y) => x - y);
  const at = (q) => samples[Math.min(samples.length - 1, Math.max(0, Math.floor(q * samples.length)))];
  return { diff: mean(diffs), lo: at(0.025), hi: at(0.975) };
}
