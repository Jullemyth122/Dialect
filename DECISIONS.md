# Decisions

Newest first. Each entry: date, decision, reason. "Proposed" means not yet confirmed by the developer.

## 2026-11-24: Kill rule 1 split into two tests
The merged rule ("beat the better single AI call by 0.6 points") could not be passed: the score tops out at +1.0, so against a baseline scoring 0.4 or more it would need more than a perfect score. New rule: the evolved network must (a) beat the forced single AI call by at least 0.6 points per mapping, and (b) beat the single AI call allowed to say "please check" with a 95% bootstrap interval above zero and no more confident wrong answers per 100. Both on at least 200 held-out mappings. Fixed before the spike, as before. See PLAN.md section 5.

## 2026-11-24: Jullemyth122/Dialect is the official repo
The developer named it the main repo. The team's fork (znex07/DialectCognizantHackaton) merges into it after its facts are checked.

## 2026-11-24: Merge of the team's review (branch `docs/update-11-24-26` on znex07/DialectCognizantHackaton)
The team ran a Gemini audit of the plan and rewrote PLAN, DECISIONS and README. We merged it into this repo as follows.

**Kept (now in PLAN.md):**
- Transfer reported as S1a (repeat codes) and S1b (new codes); the kill rule uses S1b. Otherwise "recovery" could be the agent just remembering approved codes.
- A fourth comparison: one AI call told it may say "please check". The kill rule compares against both single AI calls (rule changed again later that day, see the entry above).
- MIMIC `d_labitems` has no units. We fixed this with the real recorded units from the demo's lab events (170 of 269 coded names), not by assuming US units.
- MIMIC data is used for testing only, never in prompts or published network files, so ODbL share-alike stays in its own folder.
- The review workbench ends with a FHIR R4 ConceptMap and CSV download.
- A two-origin smoke test by 6 Dec.
- A no-key endpoint that accepts only lab-mapping requests, rate-limited and capped.
- Error-trace rule evolution, CI, the DialectProfile schema, the egress log and the local-model option, as Should or Could items.

**Dropped or reworded, with reasons:**
- "UN ITU-T SG17" as a partner: it does not appear on the challenge overview or rules pages (checked 24 Nov). Listed partners are Mozilla, MIT NANDA, AWS, UT Austin and AI Commons.
- "Hits both challenge tracks": the challenge has no tracks, only suggested ideas.
- "OAW Spec 7/7 Pass" badge: a validator that reads public files cannot check the runtime checks (consent, key isolation, private context), and the name looks like official certification. The validator is now labelled unofficial, static checks only, with no badge.
- "0-Byte Privacy Receipt ... proving": the browser's resource timing data does not include request-body sizes and reports zero sizes for other origins unless they send `Timing-Allow-Origin`, and the page would be reporting on itself. It is now an "egress log" listing every request, its destination and whether it had a body.
- "Strips PHI / zero PHI": replaced by an allowlist. Only OBX-3, OBX-6 and OBX-7 are read into a request, so there is nothing to strip.
- "72 hours + 12 buffer": the same review estimated 130 to 160 hours for the full list, and the 48 hours "saved" were never in the budget. The budget stays 84 hours with no buffer; the Should and Could tiers are the buffer.
- `docs/review.html` and its "score simulator" were not copied. Predicted scores from an AI grading its own suggestions are not evidence, and an AI screener could read them as an attempt to steer judging.

**Also fixed:** two overclaims written on 24 Nov ("without that hospital's data leaving it" in the README, "all three hospital sites" in idea-summary.md), and every doc now matches the two-hospital, three-scenario scope.

## 2026-11-24: Scope is two hospitals, three scenarios, sorted into Must / Should / Could
Hospitals A and B only; `sites/hospital-c` deleted. Active scenarios: S1 (S1a/S1b), S2 (S2a/S2b) and S3 (Should). S4 public health intake, S5 a second industry and validator v2 move to stretch. Reason: the hours (PLAN.md section 3).

## 2026-11-24: One privacy sentence everywhere
"Only a test's local code, name, unit and normal range (OBX-3, OBX-6, OBX-7) are sent, and only to the AI model the site uses. Patient fields are never read into the request. Nothing from Hospital B (lab list, alias table, key) is sent to Hospital A." Reason: earlier wording in different files disagreed, which an AI screener would flag.

## 2026-11-24: MIT licence for our code and documents
The challenge requires the project to be open source. MIT was the developer's choice. Third-party data is not relicensed: the MIMIC-derived test files (names and the units table) stay under ODbL (share-alike) and LOINC content under the LOINC licence, each in its own folder with its notice.

## 2026-11-24: Real lab names, fictional hospitals, four labelled scenarios
The real-world test set is MIMIC-IV Demo v1.0 `d_labitems`: 1,630 real lab names, 269 with hospital-assigned LOINC codes, ODbL, no patient data (v2.2 dropped the LOINC column, so v1.0 it is). Hospitals and patients are fictional and labelled synthetic everywhere, including HL7 MSH-11 = `T`. Four scenarios (referral, real dictionary, lab system switch, public health intake) share one engine. *[Changed later on 24 Nov: three active scenarios; S4 moved to stretch.]* Reason: judges and AI screeners must see both that the data is synthetic and that it is grounded in real, cited sources.

## 2026-11-24: No hidden instructions for AI judges
The rules allow AI-driven judging and also allow disqualification for tampering with the judging. We prepare for AI screening only with clear structure, evidence and consistent facts (PLAN.md section 6), never with hidden text or prompts aimed at a judge.

## 2026-11-24: One facts file
Every number in the README, Devpost text, video and UI comes from `docs/facts.md`, so no two documents disagree. Contradictions are easy for an AI screener to spot.

## 2026-11-24: Two hospitals plus the conformance validator
The challenge repo's validation step is still a TODO. A validator scores under Technological Implementation and Potential Impact, and doubles as our own Stage One test. Two hospitals are enough to show transfer. The third hospital moves to the stretch list. *[Confirmed by the team's review the same day.]*

## 2026-11-23: Submit on 10 Jan, not 11 Jan
The hard deadline is Mon 11 Jan 2027 8:00 am PST, which is midnight Manila time going into Tue 12 Jan. Submitting a day early leaves room for upload or Devpost problems.

## 2026-11-23: Kill-rule numbers fixed before the spike
Contender 3 (evolved network) must beat contender 2 (one LLM call with retrieval) by at least 0.6 mean points per mapping on at least 200 held-out mappings, and the transfer test must show a drop of at least 10 accuracy points at a new site with at least half recovered after adapting. Fixed now so the result cannot be argued after the fact. See PLAN.md section 5. *[Tightened on 24 Nov: two tests, against the forced AI call (+0.6) and the AI call allowed to say "please check" (a clear measured win), and transfer is measured on new codes only (S1b).]*

## 2026-11-23 (proposed): TypeScript, Node scripts, Vite for the sites
The browser runtime has to be JavaScript, the same stack as the developer's previous project, and Python is not installed on the dev machine. Confirm at G1, unless the spec dictates a specific runtime.

## 2026-11-23 (proposed): Generate synthetic HL7 in our own code
Synthea is Java and heavy for a 7.6 GB machine; hl7gen needs Python. A small TypeScript generator also gives us exact ground truth and full control over each hospital's quirks. Research file 05 may change this.

## 2026-11-23 (proposed): One origin per hospital site
Cross-site privacy and peer loading can only be shown between different origins. GitHub Pages project sites under one account share one origin, so each hospital needs its own Vercel project or its own subdomain. Decide at the start of P2. *[The two-origin smoke test by 6 Dec settles it.]*
