# Decisions

Newest first. Each entry: date, decision, reason. "Proposed" means not yet confirmed by the developer.

## 2026-11-24: MIT licence for our code and documents
The challenge requires the project to be open source. MIT was the developer's choice. Third-party data is not relicensed: the MIMIC-derived test file stays under ODbL (share-alike) and LOINC content under the LOINC licence, each in its own folder with its notice.

## 2026-11-24: Real lab names, fictional hospitals, four labelled scenarios
The real-world test set is MIMIC-IV Demo v1.0 `d_labitems`: 1,630 real lab names, 269 with hospital-assigned LOINC codes, ODbL, no patient data (v2.2 dropped the LOINC column, so v1.0 it is). Hospitals and patients are fictional and labelled synthetic everywhere, including HL7 MSH-11 = `T`. Four scenarios (referral, real dictionary, lab system switch, public health intake) share one engine. Reason: judges and AI screeners must see both that the data is synthetic and that it is grounded in real, cited sources.

## 2026-11-24: No hidden instructions for AI judges
The rules allow AI-driven judging and also allow disqualification for tampering with the judging. We prepare for AI screening only with clear structure, evidence and consistent facts (PLAN.md section 6), never with hidden text or prompts aimed at a judge.

## 2026-11-24: One facts file
Every number in the README, Devpost text, video and UI comes from `docs/facts.md`, so no two documents disagree. Contradictions are easy for an AI screener to spot.

## 2026-11-24 (proposed): Two hospitals plus the conformance validator
The challenge repo's validation step is still a TODO. A validator scores under Technological Implementation and Potential Impact, and doubles as our own Stage One test. Two hospitals are enough to show transfer. The third hospital moves to the stretch list.

## 2026-11-23: Submit on 10 Jan, not 11 Jan
The hard deadline is Mon 11 Jan 2027 8:00 am PST, which is midnight Manila time going into Tue 12 Jan. Submitting a day early leaves room for upload or Devpost problems.

## 2026-11-23: Kill-rule numbers fixed before the spike
Contender 3 (evolved network) must beat contender 2 (one LLM call with retrieval) by at least 0.6 mean points per mapping on at least 200 held-out mappings, and the transfer test must show a drop of at least 10 accuracy points at a new site with at least half recovered after adapting. Fixed now so the result cannot be argued after the fact. See PLAN.md section 4.

## 2026-11-23 (proposed): TypeScript, Node scripts, Vite for the sites
The browser runtime has to be JavaScript, the same stack as the developer's previous project, and Python is not installed on the dev machine. Confirm at G1, unless the spec dictates a specific runtime.

## 2026-11-23 (proposed): Generate synthetic HL7 in our own code
Synthea is Java and heavy for a 7.6 GB machine; hl7gen needs Python. A small TypeScript generator also gives us exact ground truth and full control over each hospital's quirks. Research file 05 may change this.

## 2026-11-23 (proposed): One origin per hospital site
Cross-site privacy and peer loading can only be shown between different origins. GitHub Pages project sites under one account share one origin, so each hospital needs its own Vercel project or its own subdomain. Decide at the start of P2.
