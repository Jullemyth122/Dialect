# Dialect

**Lab results that stay readable and comparable when they travel between hospitals: for doctors and nurses comparing a referred patient's results, for patients reading their own report, and for the hospital staff who connect the systems.** Underneath, an AI helper matches each hospital's own lab test names to the worldwide standard codes, says "please check" instead of guessing, and learns each hospital's habits at that hospital. Its lab list and approvals are never sent to another hospital's site. The AI model sees only each test's code, name, unit and normal range, never patient details or result values. **Not medical advice:** it never interprets a result.

Entry for the [Open Agentic Web Challenge](https://cognizant-agenticweb.devpost.com/) (Cognizant). Deadline Mon 11 Jan 2027, 8:00 am PST; we plan to submit Sun 10 Jan.

> **Synthetic scenario.** Real standards and real public lab test names; fictional hospitals and patients. Not a clinical tool and not medical advice. A human approves every match.

**Status (26 Nov 2026):** deployed.

- **Live sites:** **Hospital A** https://dialect-hospital-a.vercel.app and **Hospital B** https://dialect-hospital-b.vercel.app. Start at "How it works" (`/guide.html`).
- **What works:** the full flow. Hospital B lists and maps its tests (sample, CSV or by hand), sends results as an HL7 message file, and Hospital A opens the file and lines it up. The patient view works too.
- **Tests:** 20 pass. The challenge's `check_partner` passes on the live URLs (B can call A's network).
- **Not done yet:** the live AI chat needs a test with a real Meta key, and there is no no-key (publisher-funded) path yet, so visitors bring their own key. Redeploy with `npm run deploy`.

## Run it locally
Needs Node.js 22 or newer; there are no npm dependencies.

```shell
npm run build      # builds dist/hospital-a and dist/hospital-b
npm test           # 20 tests: scorer, units, shortlist, and checks on the built pages
npm run serve:a    # Hospital A at http://127.0.0.1:8081
npm run serve:b    # Hospital B at http://localhost:8082 (a different host name on purpose)
```

The assistant on the workbench sends your messages and the test list (code, name, unit and range only) to the AI provider you choose on the Models page or in its settings panel. Use a key with a spending limit; afterwards, delete the saved setup and close the tab.

---

## New here? Read in this order

| # | File | What you get | Time |
|---|---|---|---|
| 1 | [docs/explained-simply.md](docs/explained-simply.md) | The idea with no medical knowledge needed: a grocery-store comparison, a real example, a glossary | 10 min |
| 2 | [docs/proposal.md](docs/proposal.md) | The pitch: problem, who it helps, what makes it different | 5 min |
| 3 | [docs/idea-summary.md](docs/idea-summary.md) | The whole idea on one page, and what each judging criterion needs | 10 min |
| 4 | [PLAN.md](PLAN.md) | Scope, timeline, tasks, the go/no-go rule, risks | 15 min |

Reviewing with an AI such as Gemini? Use [docs/review-with-ai.md](docs/review-with-ai.md). It lists which files to attach and gives a ready prompt.

## All files

| File | What it is |
|---|---|
| [docs/learn-in-30-minutes.md](docs/learn-in-30-minutes.md) | Six words, a sample report to practise on, and three questions to ask a lab worker or nurse |
| [docs/data-and-scenarios.md](docs/data-and-scenarios.md) | Real data sources, how synthetic data is labelled, the three scenarios |
| [docs/facts.md](docs/facts.md) | The single source for every number and claim, with links |
| [docs/devpost-draft.md](docs/devpost-draft.md) | Title, tagline, description, submission headings |
| [research/challenge-requirements.md](research/challenge-requirements.md) | Challenge rules and spec, checked against the sources |
| [research/RESEARCH-PROMPT.md](research/RESEARCH-PROMPT.md) | Prompt that starts the research phase |
| [DECISIONS.md](DECISIONS.md) | Decisions with dates and reasons |
| [CLAUDE.md](CLAUDE.md) | Rules for the coding agent |
| [docs/brief.md](docs/brief.md) | The original brief (its Otari note is out of date) |

## Licence
- **Our code and documents:** [MIT](LICENSE).
- **Third-party data keeps its own licence**, and those files will sit in their own folders with their own notices:
  - Lab test names and the per-test units table extracted from the MIMIC-IV Clinical Database Demo v1.0 are under the Open Data Commons Open Database License (ODbL) v1.0. Cite: Johnson, A., Bulgarelli, L., Pollard, T., Horng, S., Celi, L. A., & Mark, R. (2022). MIMIC-IV Clinical Database Demo (version 1.0). PhysioNet. https://doi.org/10.13026/jwtp-v091
  - Patient-facing test explanations are shown from MedlinePlus (public-domain medical test information and health topic summaries). Source: MedlinePlus, National Library of Medicine.
  - LOINC content is used under the LOINC licence (https://loinc.org/license). LOINC® is a registered United States trademark of Regenstrief Institute, Inc.

## The idea in five lines
1. Hospitals name lab tests their own way; matching those names to the standard LOINC codes is slow manual work, and a wrong match can make a result read wrong.
2. Dialect suggests matches and is scored +1 right, 0 "please check", -5 confidently wrong, so it asks instead of guessing.
3. Each hospital's approved matches stay with that hospital, make the next batch easier, and download as a standard mapping file (FHIR ConceptMap or CSV).
4. The matches power two more screens: a **referral view** where a doctor or nurse sees a referred patient's results from both hospitals side by side (unsure ones held apart), and **"My lab report, explained"** where a patient reads each test in plain words, with explanations from MedlinePlus (US National Library of Medicine) and questions for their doctor.
5. The helper is published as an open agentic website: anyone can load and inspect it, and it runs in the hospital's own browser.

We will test it on 269 real hospital lab names and compare it fairly against a plain AI call, including one that is also allowed to say "please check". If evolution doesn't beat that, we will say so (PLAN.md section 5).

## What exists already, and what's new
AI lab mapping exists: LabBridge, LARA and RELMA already match local lab names to LOINC (sources in [docs/facts.md](docs/facts.md)). Dialect shares the skill between hospitals on the open agentic web, without sharing their data, and evolves it to ask instead of guess. On top of the matches it adds safe views for doctors, nurses and patients.

## Where else it fits
We build the hospital-referral case. The same engine fits anywhere lab results cross a boundary: reference labs, a hospital switching lab systems, public health reporting, clinical trials and insurers' quality measures (each sourced in [docs/facts.md](docs/facts.md)).
