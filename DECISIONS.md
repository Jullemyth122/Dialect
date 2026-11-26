# Decisions

Newest first. Each entry: date, decision, reason. "Proposed" means not yet confirmed by the developer.

## 2026-11-26: Patient page laid out like a patient portal
The developer found the patient page unclear ("how am I gonna use it") and unpolished. Changes:
- **One report card**, laid out like a hospital patient portal. It has a header with the lab name, the collection date, the patient and "Final", then summary chips (tests, marked by the lab, not identified).
- **Two views:** "In plain words" shows each row as an everyday name (for example, `K` becomes Potassium) with "On your report: K K+" under it. "As printed by the lab" shows the original codes in a monospace table. Switching between the two shows what Dialect does.
- **Range bar:** it draws only the lab's own range and number, and its dot is coloured only when the lab marked the result (OBX-8). It is a drawing of the lab's numbers, not our flag; the text label "Lab's range …" stays for screen readers and print.
- **Sidebar:** "Before your appointment" holds the questions and the print button. The print view became one compact page, and receipt-width paper stacks each row.
- The everyday names (for example, "Fasting blood sugar (glucose)") are our wording. The standard LOINC name is shown under "What is this test?".

## 2026-11-26: Redesign: one simple path per person, light by default
The developer found the first UI unfriendly, too dense and dark (it followed the system's dark setting). Changes:
- **Home is "Who are you?"**: three cards (patient, doctor or nurse, lab or IT staff), one line and one button each. How it works and the developer and judge details are folded away.
- **Each person has a colour and only their own information:** patient peach (simple test cards; "What is this test?" opens on tap; print for the doctor), doctor and nurse teal (patient bar, one compact table, the "do not compare" box), lab and IT indigo (progress bar, one queue with Approve / Change / Skip, the assistant in a fold-out panel).
- **Menu:** Patients · Doctors & nurses · Lab & IT · About. The AI model page moves under Lab & IT, because only the analyst uses the AI.
- **Light mode by default**, with a light/dark switch remembered in this browser. Sans-serif type and tighter spacing.
- The rules are unchanged: same banners, the same privacy sentence, no medical advice, flags only as the lab sent them.

## 2026-11-26: Coding started; stack follows the challenge's own build guide
- **Plain static HTML, CSS and JavaScript modules, no bundler; Node's built-in test runner; no npm dependencies.** Replaces the "TypeScript, Vite, Vitest" proposal of 23 Nov, which was marked "unless the spec dictates". The challenge's agentify-website skill expects a static site with its runtime copied in unchanged, a `.hocon` network compiled by its `build_network.mjs`, and `node --test`.
- **The skill is vendored** in `vendor/agentify-website/` (commit `0c0ca45`, Apache-2.0, unchanged). Our build copies its runtime into each site and runs its network builder, which validated both networks with no warnings.
- **One codebase, two builds:** `sites/hospital/` plus `sites/profiles/hospital-{a,b}.json`, built by `scripts/build-sites.mjs` into `dist/` (ignored by git).
- **Model chooser:** a Models page saves setups through the runtime's own `byok.js`, so the assistant's settings panel and the page share them. Presets: Meta's five Standard Muse models (prices from Meta's page) plus the runtime's own provider list. Contributor models are refused.
- **Unit conversions** use Labcorp's SI Unit Conversion Table only (glucose 18.02 / 0.0555, creatinine 0.0113 / 88.4, cholesterol 38.61 / 0.0259). Anything else is shown as reported.
- **LOINC names** in the subset were copied from tx.fhir.org lookups, never typed from memory.
- **The referral packet** is the clinical message: each line carries the sending lab's own LOINC code (HL7 OBX-3 can carry local and standard codes). It is not the sender's alias table. In the demo it is a synthetic file; generating it from B's approved matches is the next step.
- **Known limits, written down:** (1) the runtime runs `write` actions without a dialog. Ours (`suggest_mapping`, `skip_test`) only change the page and can be undone; `save_mapping` is `irreversible` and opens our dialog with its arguments. (2) No page-wide Content-Security-Policy yet, because a strict one can break the runtime and we can't test it in a browser on this machine; the required sandbox-worker CSP and other security headers are set. Add one after a browser test. (3) Production URLs `dialect-hospital-{a,b}.vercel.app` are placeholders until deployment. (4) A's network shares no page tools with other sites yet, so B's visitor asking A gets answers from A's instructions only; sharing A's public `find_candidates` read through `bridge/bridge-actions.js` is the next step.
- The order changed: the developer asked for the UI now, so P2/P3 site work started alongside P1. The scorer and its tests were still written first, as CLAUDE.md requires.

## 2026-11-26: Checked against the full challenge page; NANDA Index up to Should; video trademark rule
The developer pasted the full challenge page on 26 Nov. Every required item is already in PLAN.md; nothing new is required. Two changes: NANDA Index registration moves from Could to Should (about 2 hours), because discovery is the challenge's first sentence and judge Ramesh Raskar founded Project NANDA; and the video rule now says no logos, the AI provider's name off screen, and standards and the MedlinePlus credit named only as attribution. Also fixed: S3 was still labelled Should in two places; it is Could. The page also lists an Employee prize, which appears to be for Cognizant employees and does not affect us.

## 2026-11-26: Meta Model API is our AI provider
The developer will use their Meta API credits. The site's default router is a small Vercel function that adds the Meta key (an environment variable) and accepts only lab-mapping requests, marked `publisher_funded` in the manifest. Default model `muse-ember-1.0`; `muse-spark-1.3` is an evolution option. Standard mode only: never the `-contributor` models, because Meta may train on what is sent to them. BYOK accepts any OpenAI-compatible provider that allows browser calls. Reason: the challenge README accepts any OpenAI-compatible, browser-callable provider with tool calls; Meta's endpoint sends `Access-Control-Allow-Origin: *` (tested 26 Nov) and documents tool calling. Still to confirm in P1: that `muse-ember-1.0` makes the tool calls nsDeploy needs, by running the official example site with it.

## 2026-11-26: Correction: a no-key path is optional in the spec
Earlier files said the spec requires a default path that works without a visitor key. Spec §4 says a site **MAY** offer one; it must publish a default router and model. We keep the capped no-key path as Must anyway, so judges can try the site without a key. research/challenge-requirements.md, PLAN.md and idea-summary.md corrected.

## 2026-11-26: Print, OCR, read-aloud and large text, tiered
- **Print (Should, 2 to 3 hours):** the explained report and the referral table on one page each, with the disclaimers printed.
- **OCR of a paper report (Could, about 10 hours, decided at G3b on 20 Dec):** our own synthetic sample photos only, read in the browser, the crop beside every line, low-confidence lines held apart. A misread number is the risk.
- **Read aloud and large text (Could, about 1 hour each):** MedlinePlus text only.
- **Not doing:** a geographic map (decoration, not our job), a patient chat assistant (drifts into advice), AI translation (AI-written health text).
Reason: the developer asked for more creative, people-facing features. These are the ones that help patients and clinicians without breaking the medical-advice rule or the hours.

## 2026-11-26: Healthcare confirmed; Dialect stays the entry
The developer reviewed 100 alternative ideas across Cognizant's industries and 100 other healthcare ideas, and chose to keep Dialect. Reason: healthcare is one of Cognizant's largest businesses (it opened TriZetto Unify to AI agents on 29 May 2026), our real test data is already found and checked, and switching after G1 would cost weeks.

## 2026-11-26: Prior art named; we claim only the combination as new
A prior-art search found that AI lab-to-LOINC mapping already exists: LabBridge (JMIR 2026), an agentic LOINC paper (BIS 2026), LARA (LOINC Conference 2026), Wolters Kluwer's commercial mapping, RELMA, and a Nov 2026 blog post with almost our mapper design. We did not find the mapper published as a browser agent network that another hospital loads and adapts without exchanging data, evolved under an abstain-aware score. From now on every document says: "AI lab mapping exists (LabBridge, LARA, RELMA). Dialect shares the skill between hospitals on the open agentic web, without sharing their data, and evolves it to ask instead of guess." Reason: an AI screener will search for prior art; naming it ourselves turns a weakness into proof that we know the field. Sources in docs/facts.md.

## 2026-11-26: The uses of Dialect, listed and sourced
Dialect helps wherever lab results cross a boundary: referrals (built), lab-system switches (S3, Could), reference labs, clinics joining a network, public health reporting, clinical trials and insurer quality measures. Only referrals are built; the others are one sourced sentence under Potential Impact. Reason: shows reach, including Cognizant's payer and life-sciences businesses, at no build cost. PLAN.md section 1.

## 2026-11-26: Four additions, each tiered
- **CSV upload of a whole test list (Must, about 3 hours):** how analysts really work.
- **Prior art named in README, Devpost and proposal (Must, writing only).**
- **Hard-case exchange (Should, about 4 hours):** B publishes human-approved patterns of its mistakes, never data; A's evolution reads them. Learning then flows both ways without sharing data.
- **Ask the sender (Could, about 5 hours, decided at G3):** a hospital that chooses to publish its test directory, as Mayo Clinic Laboratories and ARUP publish LOINC tables, also publishes an agent that answers questions about its own codes. Only that public directory is involved, so the privacy sentence still holds. In the demo the city hospital (A) publishes its directory and acts as the provincial hospital's (B's) outside lab; B's lab list stays private.
- Also Could: approval history; a trend line in the referral view.

## 2026-11-26: Four simplifications
1. Hospitals A and B are one codebase built twice with a different hospital profile file.
2. Build one thin path end to end first (one lab line mapped, approved, shown in the referral table), then widen.
3. The referral view converts units for about 5 tests only, each with a cited factor.
4. The patient view stays Must only if two people confirm about 12 hours a week each; otherwise it is Should (unchanged rule, still waiting on section 9, question 2).

Reason: the Must list was larger than 84 hours. The CSV upload's 3 hours should be paid for by the shared codebase (estimate, checked at G3).

## 2026-11-26: Never build
Result interpretation, our own high/low flags, AI-written health text, AI translation of patient explanations (for example into Filipino), uploads of real reports, an "official" validator, a claim that AI lab mapping itself is new, a third hospital or another industry before 3 Jan. Reason: each one either breaks the medical-advice rule or invites a judge to mark us down.

## 2026-11-26: G1 slipped by a day
P0 is not finished (official example site, MIMIC units table, unit-dependence tags, section 9 answers). These go first in P1, example site first. G2 stays on Sat 28 Nov and may move by at most two days if the spike is not ready. *(Proposed; the developer confirms.)*

## 2026-11-24: Dialect serves doctors, nurses and patients too, never as medical advice
The developer wants Dialect to help doctors, other professionals and patients, not only hospital IT. Two views are added on top of the mapping engine:
- **Referral view (Must):** a referred synthetic patient's results from both hospitals lined up by LOINC code, with cited plain-code unit conversions and each lab's own flags. Unmatched results are held apart with "do not compare".
- **Patient view, "My lab report, explained" (Must; drops to Should if the team has only 84 hours in total):** sample synthetic reports explained line by line with MedlinePlus text fetched by LOINC code.

Safety rules:
- No interpretation, diagnosis or treatment advice anywhere.
- Flags appear only as the lab sent them.
- No AI-written health text; MedlinePlus "Medical test information" and health topic summaries are public domain and credited.
- Result values never leave the browser.
- Sample reports only, no real uploads, in this version.

Reason: the mapping is invisible plumbing. These views show what it is for: results a doctor can safely compare and a patient can understand. MedlinePlus Connect takes a LOINC code, allows browser calls (`Access-Control-Allow-Origin: *`, checked 24 Nov) and asks for at most 100 requests a minute. To make room, S3 moves to Could and the views replace the "Try your own code" box.

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
"Only a test's local code, name, unit and normal range (OBX-3, OBX-6, OBX-7) are sent, and only to the AI model the site uses. Patient fields are never read into the request. Nothing from Hospital B (lab list, alias table, key) is sent to Hospital A." Reason: earlier wording in different files disagreed, which an AI screener would flag. *[Extended later on 24 Nov: result values are never sent either, and the patient view sends the matched LOINC code to MedlinePlus. The current wording is in PLAN.md section 1.]*

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
