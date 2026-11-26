# Dialect: rules for the coding agent

Entry for the Open Agentic Web Challenge (Cognizant). Agents that learn each hospital's lab-code "dialect" at that hospital, without sending its lab list or approvals to peer sites, with views for analysts, doctors and nurses, and patients. The plan is in PLAN.md; background and sources are in docs/brief.md.

## Project rules
- Synthetic data only. Never add real patient or customer data to the repo.
- This is NOT a clinical tool. Every UI screen that shows a mapping must say
  "Synthetic data. Not for clinical use. A human must approve."
- Never log, store or commit API keys. A visitor's key must never be sent to a
  peer site or put in a URL, manifest, prompt or trace.
- Requests to the AI model use an allowlist: only OBX-3 (code and name), OBX-6
  (unit) and OBX-7 (normal range). Never read patient segments (PID, PV1, NK1)
  or notes (NTE) into a request. Nothing from one hospital site goes to another.
- Never give medical advice. No screen, prompt or text may interpret a result,
  suggest a diagnosis or a treatment, or compute its own high/low flag. Show
  flags only as the lab sent them (OBX-8). Never send result values (OBX-5)
  to the AI model.
- Patient-facing explanations come only from MedlinePlus (public-domain parts,
  credited "Source: MedlinePlus, National Library of Medicine"), never from an
  AI model. Cache MedlinePlus Connect responses; stay under 100 requests a
  minute. Link to, never copy, A.D.A.M. encyclopedia content (copyrighted).
- In the referral view, line up only confident matches; put everything else
  under "Not matched: do not compare". Convert units only with a cited factor.
- Every doctor/patient screen also says "Not medical advice."
- Use the privacy sentence in PLAN.md section 1 word for word; don't write
  "zero PHI", "data never leaves" or "proves" about privacy.
- Never call our validator official or show a pass badge; it is "unofficial,
  static checks only".
- Never claim that AI lab mapping itself is new. Name the prior art (LabBridge,
  LARA, the agentic LOINC coder, RELMA; sources in docs/facts.md) and claim only
  the combination in PLAN.md section 1.
- No uploads of real lab reports, and no AI translation of patient
  explanations (that is AI-written health text).
- "Ask the sender" (if built) may use only the sending hospital's own public
  test directory, never the receiving hospital's lab list.
- Hard-case exchange files hold human-approved mistake patterns only, never
  codes, names, results or patient data.
- Hospitals A and B are one codebase with a hospital profile file; don't fork
  the app per hospital.
- AI provider: Meta Model API (`https://api.meta.ai/v1`, OpenAI-compatible),
  default model `muse-ember-1.0`. Never use `-contributor` models (Meta may
  train on what they receive). The site's Meta key lives only in a Vercel
  environment variable read by the no-key endpoint; never in the repo, the
  browser bundle, the manifest or a prompt.
- OCR (if built) runs in the browser on our own synthetic sample photos only;
  show the photo crop beside every read line and hold low-confidence lines apart.
- Read-aloud reads MedlinePlus text only.
- Confident wrong mappings are worse than abstaining. Never remove the abstain option.
- Business rules that must hold (unit conversion, valid ranges) run as plain
  code, not as AI instructions.
- Every claim in docs or UI copy needs a source or must be marked UNVERIFIED.
- Keep changes small. Write a test for the scoring function before the agents.
- Record every important decision in DECISIONS.md with the date and the reason.
- Do not add dependencies without checking the licence.

## Data rules (full detail in docs/data-and-scenarios.md)
- Real standards and real public lab names; fictional hospitals and patients.
- From MIMIC-IV Demo v1.0 commit only `d_labitems` data and the per-test units table (item ID, label, LOINC, units, counted from lab events). Patient-level rows, IDs, values and times never enter the repo; delete the downloaded lab events file after counting. Keep the ODbL attribution; these files are ODbL, in their own folder.
- MIMIC data is for testing only. Never put MIMIC rows in prompts, few-shot examples or published network JSON.
- Do not change LOINC field contents; local additions start with "X"; include the LOINC notice.
- Every HL7 message: MSH-11 = `T`; patient IDs like `SYN-000123`, names `SYNTHETIC^PATIENT`.
- Every scenario has a `scenario.json` with `"synthetic": true`, and the UI shows the synthetic-scenario banner.
- Never use a real hospital's name, logo or branding.
- Report results on real names (scenario S2) separately from results on generated data, and transfer on repeat codes (S1a) separately from new codes (S1b).

## Layout
```text
/research                findings from the research phase (P0)
/profiles/lab-hl7        LOINC subset, cited conversions, lib/ (scorer, units, shortlist, csv, ConceptMap), test/
/sites/hospital          ONE codebase for both hospitals: pages/, partials/, static/ (assets, site.js, site-actions.js)
/sites/profiles          hospital-a.json, hospital-b.json (name, colours, URLs, partners)
/data/synthetic          synthetic catalogues, referral packet, sample reports, answers.json (scorer only, never shipped)
/vendor/agentify-website the challenge's skill, unchanged (runtime, build_network, serve_site, check_partner)
/scripts                 build-sites.mjs, make-images.ps1
/tests                   checks on the built sites
/dist                    build output (git-ignored)
/docs                    brief, Devpost text, plain-language docs
DECISIONS.md
```
Planned, not built yet: /sites/validator (unofficial, static checks), /data/mimic (ODbL), /evolve.

## Commands
- `npm run build` then `npm test` (Node 22+, no dependencies).
- `npm run serve:a` (http://127.0.0.1:8081) and `npm run serve:b` (http://localhost:8082): different host names on purpose.
- Never edit `vendor/`, generated `*.network.json`, `bridge/` or discovery files; change the generator in `scripts/build-sites.mjs`.
- Build page text with DOM methods (`textContent`), never `innerHTML`: the runtime uses Trusted Types.

## Machine notes
- The dev machine has about 7.6 GB RAM and often under 1 GB free. Run one heavy process at a time; do not start Java tools (Synthea) or headless browsers alongside a dev server.
- Python is not installed. Prefer Node scripts.
- With under about 1.5 GB free memory, do not start a headless browser; check pages with curl and the test suite instead.
