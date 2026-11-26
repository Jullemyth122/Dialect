# Dialect: Project Plan

Open Agentic Web Challenge (Cognizant). Updated Thu 26 Nov 2026: healthcare confirmed, prior art named, the uses of Dialect listed, four additions and four simplifications; later the same day, Meta Model API chosen as the AI provider, the no-key rule corrected, and print, OCR, read-aloud and large text tiered. The 24 Nov version merged the team's review; DECISIONS.md lists what we kept and what we dropped.

| | |
|---|---|
| **Hard deadline** | Mon 11 Jan 2027, 8:00 am PST (16:00 UTC; midnight going into Tue 12 Jan, Manila time) |
| **We submit** | **Sun 10 Jan 2027**. 11 Jan is not used |
| **Judging** | 11 to 18 Jan 2027. The sites must stay live until 18 Jan, 5:00 pm PT |
| **Budget** | About 12 hours a week for 7 weeks: **84 hours, with no spare hours**. The "Should" and "Could" items in section 2 are the buffer |
| **Read first** | [docs/explained-simply.md](docs/explained-simply.md), then [docs/idea-summary.md](docs/idea-summary.md) |
| **Rules and spec** | [research/challenge-requirements.md](research/challenge-requirements.md) |
| **Every number comes from** | [docs/facts.md](docs/facts.md) |

---

## 1. What we are building

**Dialect** makes lab results readable and comparable wherever they travel, for the people who use them: doctors and nurses, patients, and the hospital staff who connect the systems. It is an open agentic website. Under the hood it suggests the standard LOINC code for each of a hospital's own lab test names and says "please check" instead of guessing. On top of that sit three views, one per audience. **It never gives medical advice:** it never interprets a result, diagnoses or suggests treatment.

What we ship by 10 Jan:
1. **Two hospital websites** on two different origins (Hospital A and Hospital B). Each publishes a lab-code mapping agent network. B can load A's network after the visitor consents.
2. **Three views, one per audience:**
   - **Referral view, for doctors and nurses.** A referred (synthetic) patient's results from both hospitals on one table, lined up by LOINC code. Units are converted by plain code for a short, cited list of tests, and each lab's own normal range and high/low flag is shown as the lab sent it. Anything not confidently matched is held apart under "Not matched: do not compare", never placed in a trend.
   - **"My lab report, explained", for patients.** Pick a sample (synthetic) lab report and see each line with the test's plain-language name and a short explanation from **MedlinePlus** (US National Library of Medicine, public domain, fetched by LOINC code and credited), the number with the lab's own range and flag, and "questions to ask your doctor". No AI-written health text. Result numbers never leave the browser.
   - **Review workbench, for interface analysts.** Confident mappings plus a "please check" pile with the top candidates and the reason. Approve, fix or skip. Approved mappings go into B's private alias table. The work ends with a **FHIR R4 ConceptMap** (a standard mapping file) and CSV download.
3. **Evolution results**: network variants evolved offline against known answers. Every generation's network and score is published on the site.
4. **The Dialect Conformance Validator (unofficial)**: a page anyone can point at an agentic website to check its public files against the challenge spec. The challenge repo's own validation step is still an empty TODO.
5. **Shared tools**: the validator, the hospital dialect generator (fake HL7 lab messages with each hospital's quirks and known answers) and the abstain-aware scorer.

Scoring rule everywhere: **+1** correct, **0** "please check", **-5** confident and wrong.

Rules we never break:
- Synthetic data only: fictional hospitals and patients, real standards and public lab names.
- Not a clinical tool and **not medical advice**. Every screen says so, and a human approves every write.
- **No interpretation.** Dialect never says what a result means for a person's health. High/low flags are only the ones the lab sent. Patient explanations are MedlinePlus text, never AI-written. Unit conversions are plain code with a cited factor.
- **What leaves the browser, said the same way everywhere:** only a test's local code, name, unit and normal range (HL7 fields OBX-3, OBX-6, OBX-7) are sent, and only to the AI model the site uses. Result values and patient fields are never read into the request. The patient view also sends the matched LOINC code (a public code) to MedlinePlus to fetch its explanation. Nothing from B (lab list, alias table, key) is sent to Hospital A.
- The visitor's key never reaches a peer site.
- MIMIC rows are used for testing only, never as examples inside prompts or published network files.

### What is new, and what is not (checked 26 Nov; sources in docs/facts.md)
- **Not new:** using AI to map local lab names to LOINC. LabBridge (JMIR 2026), an agentic LOINC paper (BIS 2026), LARA (LOINC Conference 2026), Wolters Kluwer's commercial mapping and RELMA all do it. A Nov 2026 blog post describes almost our mapper design. We name them ourselves, before a judge or an AI screener finds them.
- **What we claim as new** (not found in our searches, which is not proof): the mapping skill is **published as an agent network on the open agentic web**, another hospital **loads it in its own browser and adapts it to its own codes without either hospital sending its data to the other**, it is **evolved under a score that punishes confident mistakes**, and its matches power safe views for doctors, nurses and patients.
- One sentence for every document: *"AI lab mapping exists (LabBridge, LARA, RELMA). Dialect shares the skill between hospitals on the open agentic web, without sharing their data, and evolves it to ask instead of guess."*

### Where Dialect is useful: wherever lab results cross a boundary
| Situation | Who is helped | How we use it |
|---|---|---|
| **A patient referred between hospitals** | Doctor, nurse, patient, analyst | **Built.** The main story (S1) |
| A hospital switches lab systems and its codes change | Lab analyst | Built if time allows (S3, Could) |
| A hospital sends samples to an outside reference lab and gets results back in that lab's codes | Lab analyst, doctor | One sentence in the pitch (reference labs publish LOINC tables: docs/facts.md) |
| A small clinic or lab joins a hospital network | IT, doctor | One sentence in the pitch |
| Labs report results to public health | Health office | One sentence (electronic lab reporting needs LOINC mapping) |
| Clinical trials collect lab data from many sites | Pharma | One sentence (FDA expects LOINC in trial lab data) |
| Insurers compute quality scores from lab results | Insurers | One sentence (HEDIS uses LOINC value sets) |

We build only the first. The others go into one sourced sentence under Potential Impact: "the same engine fits reference labs, lab-system switches, public health reporting, clinical trials and insurers."

### The AI's one job
Given a hospital's own test code, name, unit and normal range, return the LOINC code or "please check". It never sees result values or patient details, and never says what a result means. Each hospital configures its own: the model (the site's no-key default or the analyst's own key), its private alias table of approved matches, and the evolved settings (prompt, number of candidates, "please check" threshold, unit-check order). Only the analyst talks to the AI. The doctor sees matches the analyst approved; the patient sees MedlinePlus text.

### Never build (these lose points or break the rules)
- Interpreting results, computing our own high/low flags, or any AI-written health text.
- Uploading real reports or using real patient data.
- AI translation of patient explanations (for example into Filipino): that would be AI-written health text.
- Calling the validator official, or claiming that AI lab mapping itself is new.
- A third hospital or another industry before 3 Jan.
- A chat assistant for patients (it would drift into advice, and every other entrant will have one).
- A geographic map of hospitals: Dialect's job is codes, not places. The lineage view already shows which site learned from which.
- Uploading real photos of lab reports (the OCR Could item uses our own synthetic sample photos only).

---

## 2. Scope: must, should, could

Every feature from both reviews, sorted. **Must** items are the entry. **Should** items get built if P1 to P3 land on time. **Could** items happen only when a gate is passed early. When hours slip, cut from the bottom up.

| Tier | Feature | Why |
|---|---|---|
| **Must** | Hospitals A and B on two Vercel origins, with a **two-origin smoke test by 6 Dec** | Peer loading only proves anything across origins. Testing early catches CORS and runtime surprises before the holidays |
| **Must** | Stage One files: manifest, Neuro SAN network JSON, `links.json`, runtime, interface, the four visible error stops | Stage One is pass/fail |
| **Must** | Default AI path with no key: a same-origin endpoint that accepts only lab-mapping requests, adds our Meta Model API key server-side (`llm_router.publisher_funded`), with a rate limit, a daily spend cap and a labelled replay when the cap is hit | The spec only says a site MAY offer a no-key path (corrected 26 Nov), but it must publish a default router and model, and judges should not need a key to try the site. Paid from the developer's Meta credits. A narrow endpoint is hard to abuse |
| **Must** | Bring your own key, kept in the browser: any OpenAI-compatible provider that allows browser calls (Meta Model API, OpenRouter, hosted Otari) | Shows the spec's rule that the key never reaches a peer |
| **Must** | Field allowlist: only OBX-3, OBX-6 and OBX-7 are sent, with a visible "what is sent" preview | Cheap, and makes the privacy claim checkable |
| **Must** | Review workbench with approve, fix, skip and the "save mapping" site action that shows its arguments first | The product. Also the spec's grounded capability |
| **Must** (added 26 Nov) | Load a whole test list as a CSV (the hospital's test catalogue), not only one message at a time (about 3 hours) | It is how analysts actually work. Makes the workbench a product, not a demo |
| **Must** | ConceptMap and CSV download | Ends the analyst's job with something a hospital system can use. About 2 hours |
| **Must** | Referral view for doctors and nurses (about 8 hours), with cited unit conversions for **about 5 tests only** (glucose, creatinine, cholesterol and similar) | Shows the payoff: the same patient's results from two hospitals, comparable and safe. Also the clearest 30 seconds of the video |
| **Must** | Patient view, "My lab report, explained" (about 6 hours; replaces the "Try your own code" box) | Patients are a real audience; MedlinePlus gives trusted wording, so no AI health text is needed. **First to drop to Should** if the team has only 84 hours in total |
| **Must** | Scorer, generator and the four-way comparison (section 7) | Without a fair comparison the results mean nothing |
| **Must** | Transfer reported in two parts: S1a repeat codes, S1b new codes | Shows learning, not only remembering |
| **Must** | S2 on real MIMIC names, with their real recorded units | The result on data we did not invent |
| **Must** | Offline evolution of the network's settings, every generation published | The kill rule and the judges' field |
| **Must** | Validator v1, labelled **unofficial, static checks only** | Our own Stage One test and our shared tool |
| **Must** (added 26 Nov) | Prior art named in the README, Devpost text and proposal: LabBridge, LARA, the agentic LOINC paper, RELMA, with what is new stated in one sentence (section 1) | Free. An AI screener checks novelty; naming prior art ourselves shows we know the field (Quality of the Idea) |
| **Must** | The video in your own voice | Required |
| **Should** | Evolution that also changes the network's disambiguation rules, based on its -5 mistakes, with readable "before and after" rule diffs | More convincing than tuning numbers. Try it in the P1 spike; keep it only if it scores better |
| **Should** | Egress log: a list of every request B makes, its destination and whether it had a body | Lets a judge check that A received only GET requests for public files |
| **Should** | CI: JSON files valid and unit tests pass on every push | Cheap protection |
| **Should** | DialectProfile v1 schema (standard subset + generator + scorer behind one format) | Makes the engine reusable in other fields |
| **Should** | 3-person timed user test and one practitioner quote | Design and Impact evidence |
| **Should** (added 26 Nov) | **Print:** "My report, explained" as one page for the patient to bring to the doctor, and the referral table for the doctor or nurse, with "Not matched: do not compare" and "Not medical advice" on the page (about 2 to 3 hours, mostly a print stylesheet) | Paper still travels with patients; it works where hospitals have no connected systems. Lifts Design |
| **Should** (added 26 Nov) | **Hard-case exchange:** B publishes the *patterns* of its -5 mistakes as a public file (for example "whole-blood glucose was confused with serum glucose"), never codes, names or results; A's evolution reads them as hints (about 4 hours, built with the evolution in P4) | Learning then flows both ways between sites without sharing data, which sharpens what is new. Reuses the rule-mutation work. Each pattern is written or approved by a human before it is published |
| **Could** | S3 lab system switch (moved down on 24 Nov to make room for the two new views) | Shows it asks instead of applying stale mappings |
| **Could** (added 26 Nov; decide at G3, 6 Dec) | **Ask the sender:** a hospital that *chooses* to publish its test directory (as Mayo Clinic Laboratories and ARUP publish LOINC tables) also publishes a small agent that answers "what does your code X mean?". The receiving site calls it, with consent, before asking its own AI (about 5 hours). In the demo, A acts as B's outside lab: B sends some samples to A, results come back in A's codes, and B asks A's directory agent. B's lab list is never published | The clearest site-to-site agent call in the project. Only the sender's own public directory is involved, so the privacy sentence still holds. Decide once the two-origin smoke test shows nsDeploy handles cross-site calls |
| **Could** (added 26 Nov) | Approval history: who approved what, and when | Real hospitals need an audit trail |
| **Could** (added 26 Nov; decide at G3b, 20 Dec) | **Read a paper report (OCR):** a photo of a printed report is read in the browser (Tesseract.js or similar; licence to check), each line matched and explained. Sample photos of our own synthetic printed reports only. The cropped photo sits beside every line; low-confidence lines go under "We couldn't read this line. Check your paper" (about 10 hours) | "Paper is the hardest dialect": the most creative feature and a strong video moment. Risky: a misread number (5.6 read as 56) is dangerous, hence the crops and the hold-apart rule. Only if the core journey works by 20 Dec |
| **Could** (added 26 Nov) | Read aloud (browser speech, reading MedlinePlus text only) and large-text mode on the patient view (about 1 hour each) | Older patients and people who struggle to read |
| **Could** (added 26 Nov) | Trend line for one test across both hospitals in the referral view | Useful to doctors; only after the table is solid |
| **Could** | Local AI model option (OpenAI-compatible server on the analyst's own computer) | Real hospitals would want it, but it needs server setup (`OLLAMA_ORIGINS` for Ollama), Chrome may ask permission before a website reaches the computer it runs on, and judges won't have it. Optional only |
| **Could** | Script that checks `docs/facts.md` against `results.json` | Nice; a manual check before submitting does the same job |
| **Could** | Error ranges on every published result and a cost chart (the kill rule's one bootstrap interval is already Must, in the scorer) | Strengthens the numbers |
| **Could** | Drift report download for S3 | Only if S3 is built |
| **Could** | NANDA Index registration | Discovery without hard-coded links |
| **Stretch** | Hospital C, S4 public health intake (eICU names), S5 a second industry, validator v2 live checks | Cut on 24 Nov. Do not start them before 3 Jan |

Other defaults:

| Decision | Default | Why |
|---|---|---|
| Runtime | Reuse the nsDeploy reference runtime (Apache-2.0) | Writing our own would eat the Stage One week |
| AI provider (26 Nov) | **Meta Model API** (`https://api.meta.ai/v1`, OpenAI-compatible), paid with the developer's Meta credits. Default model **`muse-ember-1.0`** (cheapest, made for high-volume tool calls); try `muse-spark-1.3` as an evolution option. **Standard mode only**, never the `-contributor` models, which let Meta train on what we send | The challenge README accepts "any OpenAI-compatible provider that accepts calls from a browser" and asks for a model that makes tool calls. Meta's endpoint answered a browser preflight with `Access-Control-Allow-Origin: *` (checked 26 Nov), and its docs list tool calling. All four contenders in the kill rule use the same model, so the comparison stays fair |
| Where the key lives | The Meta key is a Vercel environment variable used only by the no-key endpoint. Never in the repo, the browser bundle, the manifest or a prompt | The spec lets a default-inference endpoint use publisher credentials, but a key in the browser would be public |
| Evolution | Offline Node scripts, results published as files | The browser runtime only lives as long as the tab |
| Stack | TypeScript, Vite for the sites, Node scripts, Vitest | Same stack as your previous project; Python is not installed |
| Hosting | One Vercel project per hospital, each on its own `*.vercel.app` origin | GitHub Pages project sites share one origin |
| One codebase, two hospitals (26 Nov) | Hospitals A and B are the same app, built twice with a different hospital profile file (name, colour, synthetic test list, peers) | Roughly halves the site work and keeps both sites consistent. Expected to save more than the 3 hours the CSV upload adds (estimate; check at G3) |
| Build order (26 Nov) | One thin path end to end first: one lab line mapped → approved → shown in the referral table. Then widen | A rough but complete journey scores better under Design than polished pieces that don't connect |

---

## 3. Timeline

| Phase | Dates | Hours | Main output | Gate |
|---|---|---|---|---|
| **P0 Research** | Mon 23 to Wed 25 Nov | 4 | `research/00-summary.md` and 7 files, the MIMIC units table | **G1, Wed 25 Nov:** confirm scope (section 2) and answer section 9 |
| **P1 Spike** | Thu 26 to Sat 28 Nov | 9 | Scorer, generator, four-way comparison, S1a/S1b transfer test, first S2 run | **G2, Sat 28 Nov:** kill rule (section 5) |
| **P2 Stage One + validator v1** | Sun 29 Nov to Sun 6 Dec | 14 | Hospital A live and conforming, minimal B loading A, validator checks A | **G3, Sun 6 Dec:** validator passes on A's live URL, and minimal B loads A across two origins |
| **P3 Core build** | Mon 7 to Sun 20 Dec | 22 | Full Hospital B workbench, review queue, alias table, ConceptMap/CSV download; validator posted in Discussions | **G3b, Sun 20 Dec:** full A-to-B journey works + first mock judging |
| **P4 Evolution and proof** | Mon 21 Dec to Sun 3 Jan | 20 | Evolution, all experiments, results card, user test, practitioner quote | **G4, Sun 3 Jan:** feature freeze + second mock judging |
| **P5 Submission** | Mon 4 to Sat 9 Jan | 15 | Video, Devpost text, screenshots, README | Video done **Thu 7 Jan** |
| **Submit** | **Sun 10 Jan** | | Entry submitted | |

**Status on Thu 26 Nov: G1 slipped.** Healthcare and the scope were confirmed today, but P0 is not finished: the official example site has not been run, the MIMIC units table and unit-dependence tags are not built, and section 9 is unanswered. These move to the start of P1, **example site first** (about 1 hour), because everything else depends on nsDeploy. G2 stays on Sat 28 Nov; if the spike is not ready by then, move G2 by at most two days and record it in DECISIONS.md.

P4 falls over Christmas, Rizal Day and New Year, and has the most new work. If B is done early, build the evolution scripts in P3 week 2 so that P4 is mostly running them.

**The hours only add up if the Should and Could items stay optional.** The team's review estimated 130 to 160 hours for everything listed. The two new views add about 11 hours to the Must list (14 hours, minus the 3-hour "Try your own code" box they replace), which is more than one person's 84 hours. With two people on the team it fits. With only 84 hours in total, the patient view moves to Should. If G3 slips past 6 Dec, drop every Could item that day. The 26 Nov additions put about 3 hours on the Must list (CSV upload; naming prior art is writing, not build time), meant to be paid for by building both hospitals from one codebase.

---

## 4. Phase details

### P0 Research (Mon 23 to Wed 25 Nov)
- [ ] Run [research/RESEARCH-PROMPT.md](research/RESEARCH-PROMPT.md) and get the 8 research files.
- [x] Find a **real, legally usable** list of local lab test names with known LOINC codes. **Found 24 Nov:** MIMIC-IV Demo v1.0 `d_labitems`, 1,630 real names, 269 with hospital-assigned LOINC codes, ODbL, no patient data.
- [x] Confirm the LOINC licence lets us bundle a subset. **Yes, 24 Nov:** records may be deleted, fields not changed. Still to find: the exact notice text.
- [x] Check whether real units exist for the 269 coded names. **Yes, 24 Nov:** the demo's lab events record a unit for 170 of them (for example Sodium in mEq/L, Bilirubin in mg/dL).
- [ ] Build the **MIMIC units table**: one row per test (item ID, label, LOINC, recorded units), counted from the lab events with a Node script. No patient IDs, values or times are kept, and the downloaded patient-level file is deleted afterwards. ODbL, in its own folder.
- [ ] Tag each of the 269 as unit-dependent (the code changes with the unit, as with glucose 1558-6 vs 14771-0) or not.
- [ ] Clear the remaining checks in [docs/data-and-scenarios.md](docs/data-and-scenarios.md): MSH-11 values, a source for SI vs conventional units, LOINC synonym fields, a web check that our fictional hospital names are not real.
- [ ] Clear every CHECK item in [research/challenge-requirements.md](research/challenge-requirements.md), including everyone's age (18+).
- [ ] Spot-check 5 cited sources yourself.
- [ ] **Run the challenge's own example site locally** (clone cognizant-ai-labs/agentic-web, follow its README, load one example network in the browser). One hour. Nobody on the team has touched nsDeploy yet; finding its quirks now is cheaper than on 6 Dec.
- [ ] Find a cited source for each unit conversion factor the referral view will use (for example glucose mmol/L to mg/dL).
- [ ] **Start the practitioner outreach now:** message 3 to 5 people (school contacts, LinkedIn): doctors or nurses for the referral view, and hospital IT, HIMS or lab informatics staff for the workbench. Ask for a 10-minute chat in December. Replies take weeks; the quote is due in P4.
- [ ] Agree who builds what (section 9, question 5).
- [x] **Prior-art search (26 Nov):** AI lab mapping already exists (section 1). Sources are in docs/facts.md.
- [x] **Sources for the "other users" sentence (26 Nov):** reference labs, FDA trial lab data, HEDIS, public health lab reporting, and Cognizant's TriZetto Unify announcement. In docs/facts.md.

### P1 Spike (Thu 26 to Sat 28 Nov)
- [ ] **First, carried over from P0:** run the official example site (1 hour), with the Meta Model API as its provider under Advanced settings (base URL `https://api.meta.ai/v1`, model `muse-ember-1.0`, your key), to confirm tool calls work. Then build the MIMIC units table and the unit-dependence tags.
- [ ] **Scorer first, with tests:** +1 / 0 / -5, plus accuracy, "please check" rate, wrong-confident rate, and a bootstrap 95% interval for the difference between two contenders (needed by kill rule 1b).
- [ ] **LOINC subset:** the most-used lab codes plus every code in the MIMIC test set.
- [ ] **Dialect generator:** clean result + hospital profile → HL7 v2 ORU^R01 message (MSH-11 = `T`) with that hospital's quirks (local codes, abbreviations, units, missing fields) and the known right answer.
- [ ] **Four contenders** on ≥200 held-out mappings (section 7): string match, one AI call forced to answer, one AI call allowed to say "please check", and a small evolved network.
- [ ] **Transfer test:** tune on A, run on B, adapt on B. Report S1a (codes the analyst already approved) and S1b (new codes) separately.
- [ ] **First S2 run** on the real names, with and without the recorded units.
- [ ] **Rule mutation try-out (Should):** let the evolution change one disambiguation rule after a -5 mistake (for example "if the specimen is whole blood, prefer the blood code"). Keep it only if the held-out score improves.

What evolves by default: the prompt template (from a fixed list), the number of candidate codes shown, which examples are included, the "please check" threshold, and whether the unit check runs before or after the mapper. "Adapting to a site" means that site's approved mappings become examples and hints for that site only.

### P2 Stage One site + validator v1 + two-origin test (Sun 29 Nov to Sun 6 Dec)
Build one app with a hospital profile file; Hospital A and minimal Hospital B are two builds of it (section 2, other defaults). Get one thin path working first: one lab line mapped, approved, shown.

Hospital A:
- [ ] Public HTTPS URL; ODbL and LOINC data in their own folders with their notices
- [ ] `agent-manifest.json` with the networks, default router and model, peer policy and `allowed_peers`
- [ ] Network as fully resolved Neuro SAN JSON, with a front agent
- [ ] `links.json` peer-network link map, and CORS headers on every public file
- [ ] Runtime file (nsDeploy) and an interface
- [ ] Default AI path with no key: a Vercel function that adds the Meta key from an environment variable, accepts lab-mapping requests only, with rate limit, daily spend cap and labelled replay fallback; the manifest marks the router `publisher_funded`
- [ ] Check that `muse-ember-1.0` makes the tool calls nsDeploy needs (one test call in the P1 example-site run)
- [ ] Bring-your-own-key settings; the key stays in the browser
- [ ] Field allowlist (OBX-3, OBX-6, OBX-7) with unit tests, and the "what is sent" preview
- [ ] "Save mapping" site action showing destination and arguments before it runs
- [ ] Visible errors for: invalid network, composition cycle, over-budget request, denied origin
- [ ] Banner on every mapping screen: "Synthetic scenario. Real standards and public lab names; fictional hospitals and patients. Not for clinical use. A human must approve."

Minimal Hospital B (smoke test only):
- [ ] Deployed on a second Vercel origin; shows the consent card naming A's origin and purpose; loads A's network by exact name; runs it.
- [ ] **At G3, decide "Ask the sender"** (section 2, Could): build it only if the smoke test shows cross-site calls work cleanly and P2 finished on time.

Validator v1 (a static page that fetches public files only):
- [ ] Takes a site URL; checks the manifest, network JSON, `links.json`, CORS headers, front agent, exact-name resolution and schema validity
- [ ] Shows pass/fail per spec section, with the spec quote and a fix hint, and says clearly that runtime checks (consent, key isolation, private context) need a live run and are not covered
- [ ] Exports the report as JSON
- [ ] Is titled "unofficial". No badge that could look like Cognizant certification

### P3 Core build (Mon 7 to Sun 20 Dec)
Week 1:
- [ ] Move the generator and scorer into `profiles/lab-hl7/` as Dialect Profile #1 (the DialectProfile v1 schema is a Should).
- [ ] Agent network: HL7 parser agent, mapper agent, unit-check tool (plain code), front agent.
- [ ] "Please check" path showing the top 3 candidates and the reason.
- [ ] Post validator v1 and the generator in the challenge repo's Discussions (about 10 to 13 Dec), so other entrants can use it before judging.

Week 2:
- [ ] Full Hospital B workbench: approve, fix or skip; approved mappings go to B's private alias table; the score updates.
- [ ] CSV upload of a whole synthetic test catalogue, with the "what is sent" preview covering every row.
- [ ] ConceptMap and CSV download (a site action that shows what it writes).
- [ ] **Referral view:** synthetic patient `SYN-000123` with results from A (SI units) and B (conventional units) on one table by LOINC; plain-code unit conversion for a short list of tests with cited factors (glucose, creatinine, cholesterol and similar); each lab's own range and flag; unmatched results under "Not matched: do not compare"; banner "Synthetic data. Not for clinical use. Not medical advice."
- [ ] Live "Conformance" panel on the site for the runtime checks the validator can't do.

### P4 Evolution and proof (Mon 21 Dec to Sun 3 Jan)
- [ ] Evolution loop in `evolve/`: population 8, about 10 generations, fitness on a held-out set.
- [ ] Publish each generation's network JSON and score, with a lineage view (and rule diffs, if the Should item made it).
- [ ] Hard-case exchange (Should): B's human-approved mistake patterns published as a public file; A's evolution reads them. Measure whether A's held-out score improves; publish the result either way.
- [ ] Run the experiments in section 7; publish `results.json` and a results card.
- [ ] **Patient view, "My lab report, explained":** 3 synthetic sample reports, plus a box to type a test name. Each line shows the plain-language test name, the MedlinePlus explanation fetched by LOINC (cached; at most 100 requests a minute; credited "Source: MedlinePlus, National Library of Medicine"), the value with the lab's own range and flag, and fixed "questions to ask your doctor". Unmatched lines say "We couldn't identify this test. Ask the lab or your doctor." Banner: "Not medical advice. Talk to your doctor about your results."
- [ ] Print layouts (Should): the explained report and the referral table, each fitting one page, with the disclaimers printed.
- [ ] Read aloud and large text (Could), if hours remain.
- [ ] OCR of a paper report (Could), only if decided at G3b: print our synthetic sample reports, photograph them, read them in the browser, crops beside every line.
- [ ] Egress log (Should).
- [ ] User test: 3 people, no help, timed. Fix what confuses them. Include at least one non-technical person on the patient view and, if possible, a nurse or doctor on the referral view. (Should)
- [ ] Ask one real practitioner for two sentences of feedback, quoted with permission: a doctor or nurse on the referral view, or a hospital IT, HIMS or lab informatics person on the workbench. (Should)

### P5 Submission (Mon 4 to Sat 9 Jan)
- [ ] Video under 2 minutes, **your own voice**, the site running in a browser, the key result in the first 30 seconds, public on YouTube, with uploaded captions. No third-party trademarks or copyrighted music. Use generic words ("hospital interface systems") rather than product names.
- [ ] Devpost text following section 6, with a "What exists already, and what's new" paragraph under Quality of the Idea and the one "other users" sentence under Potential Impact.
- [ ] Screenshots, each with a caption saying what it proves.
- [ ] README: a 30-second summary, live links, how to verify each claim, licence, honest limits.
- [ ] Otari details if Otari is used.
- [ ] Final check on a phone and a laptop in fresh browser profiles. Run the validator on both sites one last time.

---

## 5. Kill rule (G2, Sat 28 Nov)

Mean score per mapping runs from -5 to +1, a range of 6. These numbers are fixed before the spike, so the result can't be argued afterwards.

1. **Evolution must earn its place.** On at least 200 held-out mappings, the evolved network must pass both tests:
   - **a.** Beat the single AI call that is **forced to answer** by at least **0.6 points per mapping**.
   - **b.** Beat the single AI call that is **allowed to say "please check"**, with the 95% bootstrap interval of the difference above zero, and with **no more** confident wrong answers per 100.

   Why two tests: the score can never go above +1.0. A fixed +0.6 margin over a baseline that already scores 0.4 or more would be impossible, and the rule would fail a good result. Test b asks for a clear, measured win instead.
2. **Transfer must be real.** On **new codes only** (S1b), accuracy at B before adapting must be at least **10 points** below A, and adapting must win back at least **half** of the drop.

**If rule 1 fails,** the evolution claim dies, but not necessarily the product. A single AI call allowed to say "please check", inside the same two-site workbench with the validator, is still a complete entry. Decide at G2 between that and a fallback idea (Silicon Breeders, Jury of Strangers or Safe Generative UI), keeping in mind that one judge works on evolutionary AI.
**If rule 2 fails,** drop the transfer story and lead with the workbench and the S2 real-name result.

The validator moves with us either way. Record the numbers and the decision in DECISIONS.md.

---

## 6. Passing both AI screening and human judges

The rules allow "automated AI-driven analysis", and judges need not watch past 2 minutes. An AI screener reads text, checks links and files, and compares claims against evidence. A human judge skims and looks for one memorable moment.

### What an AI screener rewards, and what we do
| An AI screener will likely… | So we… |
|---|---|
| Match the text against each criterion | Use the four criterion names as headings, word for word, and answer each in the first two sentences under it |
| Check the Stage One items | Include a table mapping each requirement to a live URL, and our validator report as proof |
| Parse our JSON files | Keep the manifest, network and `links.json` valid (checked in CI); publish `results.json` and the validator report |
| Look for evidence behind claims | Put a number, a link or a screenshot next to every claim, and mark anything unchecked as UNVERIFIED |
| Penalize overclaiming and contradictions | One facts file; one privacy sentence (section 1) used everywhere; no partner, track or certification we can't point to on the challenge pages |
| Read the video transcript | Upload our own captions |
| Check novelty against prior art | Name LabBridge, LARA, the agentic LOINC paper and RELMA ourselves, and claim only the combination in section 1 as new |
| Check whether data is real, private or made up | Label every scenario as synthetic in the UI, `scenario.json`, HL7 MSH-11 = `T`, `DATA.md` and the Devpost text, and cite every real source with its licence |

**Never** add hidden text or instructions aimed at AI judges. The rules allow disqualification for tampering with the judging. Don't put AI-generated "predicted scores" in the repo or the submission either.

### What passes each part (added 26 Nov)
| To pass | What must be visible | Who checks it best |
|---|---|---|
| **Stage One** (pass/fail) | Manifest, Neuro SAN network JSON, `links.json`, runtime, interface, LLM and key settings, the no-key default path, the four visible errors, consent before B contacts A | AI screener (files) |
| **Technological Implementation** | B loads A's network across two origins; the key never reaches A; private context blocked; the "save mapping" site action shows its arguments; evolved generations published; validator v1 | AI screener (files, validator report) and humans (video) |
| **Design** | Three people each finish a real task: the analyst uploads a test list and downloads a ConceptMap, the doctor reads the referral table, the patient reads an explained report | Humans (video, live site) |
| **Potential Impact** | The referral story told well; the one sourced "other users" sentence; the four-way comparison; 269 real names with real units; "lined up wrongly: 0"; validator and generator shared | Both |
| **Quality of the Idea** | Prior art named; one sentence on what is new (sharing the skill without the data, evolved to ask instead of guess); "Not matched: do not compare"; real HL7 and LOINC detail | Both; an AI screener will search for prior art |

### The moments that should impress both
0. **The doctor's screen:** the referred patient's fasting glucose arrives as `GLU-F 5.6 mmol/L`. Mapped wrongly, it would read as 5.6 mg/dL, dangerously low instead of slightly high. In the referral view it sits next to the city hospital's results, converted (about 101 mg/dL), and with the lab's own "H" flag. A test Dialect wasn't sure about sits apart under "Not matched: do not compare". Then the patient view shows the same report in plain words, with MedlinePlus explanations and questions for the doctor.
1. **The transfer curve on new codes:** good at A, drops at B, climbs back as the analyst approves a handful of mappings, without B's lab list going anywhere.
2. **The refusal:** a confusing local code where the forced AI call guesses wrong and Dialect says "please check". The -5 rule makes that refusal visible as points saved.
3. **The real-data result:** the same scoring on 269 real hospital names, with their real units.
4. **The finished job:** the analyst downloads a ConceptMap a hospital system could import.
5. **The validator:** the organizers' repo still has an empty "run the validation script" TODO, and we ship one any entrant can use.

The video's first 30 seconds show 0 and 2. The Devpost text leads with 0 and 5 under Potential Impact.

### Mock judging (G3b and G4)
- [ ] Give two different AI models only the Devpost text, screenshots, video transcript and live links. Ask each to score the four criteria from 1 to 10 using the rules' wording, and to list what is overclaimed or missing. Use [docs/review-with-ai.md](docs/review-with-ai.md).
- [ ] Ask one human who has never seen the project to do the same from the text and video only.
- [ ] Fix the lowest-scoring criterion first. Repeat at G4.

---

## 7. Experiments and the numbers we publish

All on held-out data the agents never saw. Results on real MIMIC names are reported separately from results on generated data.

| Experiment | What it shows | Published as |
|---|---|---|
| Four-way comparison | String match vs one AI call forced to answer vs one AI call allowed to say "please check" vs the evolved network, on the +1 / 0 / -5 score and wrong answers per 100 | Results card |
| S1a: repeat codes | How much work approved mappings save when the same codes come back (no AI call needed) | Results card |
| S1b: new codes | Accuracy at A, at B before adapting, at B after adapting, on codes B has never approved | Transfer curve |
| S2a: real names only | The 269 real MIMIC names with no unit: unit-dependent names should get "please check" | Real-data card |
| S2b: real names and units | The same names with their real recorded units (170 of 269): how much coverage the unit check recovers | Real-data card |
| S3: lab system switch (Should) | Wrong confident answers after codes change overnight | Results card |
| Referral view check | On the synthetic referral patients: results lined up correctly, held apart as "do not compare", and lined up wrongly (target: 0) | Results card |
| Evolution | Score per generation (and rule diffs, if built) | Lineage view |
| Hard-case exchange (Should) | A's held-out score with and without B's published mistake patterns | Results card |
| Cost | Score against tokens per message | Chart |
| Privacy | What A received from B: GET requests for public files only, no bodies, no key | Egress log export (Should) |

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| A single AI call, told it may say "please check", already does as well | Kill rule 1b on 28 Nov compares against exactly that |
| No one on the team has used nsDeploy | Run the official example site in P0, before the spike |
| No practitioner answers in time | Outreach starts in P0; without a quote, say so and lean on the cited sources |
| Transfer "recovery" is only remembering approved codes | S1a and S1b reported separately; the kill rule uses S1b |
| Our fake quirks are cleaner than real hospitals | The S2 real-name test, and saying so openly |
| MIMIC's name list has no units | Real recorded units from the demo's lab events (170 of 269) |
| ODbL share-alike spreading into our MIT code | MIMIC data stays in its own folder and is never put in prompts or network JSON |
| The no-key endpoint gets drained | Lab-mapping requests only, rate limit, daily spend cap, labelled replay |
| Meta credits run out, or the Meta Model API changes (Meta already replaced its older Llama API) | Daily cap and labelled replay; the provider is one router setting, so switching to another OpenAI-compatible provider needs no change to the agent network. Check the credit balance at every gate |
| OCR misreads a number | OCR stays Could; crops beside every line; low-confidence lines held apart; sample photos only |
| Cross-origin surprises in nsDeploy | Two-origin smoke test by 6 Dec |
| Scope creep from reviews | Section 2 tiers; Should and Could are optional by definition |
| Overclaiming gets flagged | One facts file, one privacy sentence, an honest limits section |
| Looks like a clinical product | Disclaimers, human approval, interoperability framing |
| The doctor or patient view reads as medical advice | No interpretation anywhere: flags only as the lab sent them, MedlinePlus text only, no AI-written health text, "Not medical advice" on every screen, sample reports only (no uploads of real reports in this version) |
| A wrong match shows a doctor a misleading comparison | Only confident matches are lined up; everything else is held apart with "do not compare"; unit conversion only for the cited list |
| MedlinePlus is down or rate-limits us | Cache each explanation; fall back to the LOINC name and a link to MedlinePlus |
| Low-memory machine (about 7.6 GB) | No Synthea or Java; one heavy process at a time |
| A judge finds LabBridge or LARA and decides the idea isn't new | We name them first and claim only the combination (section 1) |
| "Ask the sender" blurs the privacy story | Only the sender's own public directory; it stays a Could, decided at G3 |
| We are a day behind (G1 slipped) | P0 leftovers go first in P1; G2 moves at most two days, recorded in DECISIONS.md |

**Never cut:** the two-origin Stage One sites, the no-key default path, the review workbench with ConceptMap download, the referral view, the four-way comparison, validator v1, the video.

---

## 9. Open questions (answer by Wed 25 Nov)

1. Is everyone entering 18 or older? (Rules requirement.)
2. Is 12 hours a week realistic until 10 Jan, for each person? This decides whether the patient view stays a Must (two people) or drops to Should (84 hours in total).
3. What daily spend cap do you want on the no-key endpoint during judging (for example $1 to $2 a day), and how many Meta credits do you have? (Provider decided 26 Nov: Meta Model API.)
4. Will we use Otari? Probably not, since we use Meta's API; if we do, the submission needs the Otari email and one or two sentences of feedback.
5. Who builds what? A suggested split: one person takes the sites, runtime, validator and the three views (P2, P3); the other takes the scorer, generator, experiments and evolution (P1, P4). Both review each other's work and the docs.
6. Official submission repo: **Jullemyth122/Dialect** (confirmed 24 Nov). The team fork merges into it.
