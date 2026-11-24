# Dialect: rules for the coding agent

Entry for the Open Agentic Web Challenge (Cognizant). Agents that learn each hospital's lab-code "dialect" at that hospital, without sending its lab list or approvals to peer sites. The plan is in PLAN.md; background and sources are in docs/brief.md.

## Project rules
- Synthetic data only. Never add real patient or customer data to the repo.
- This is NOT a clinical tool. Every UI screen that shows a mapping must say
  "Synthetic data. Not for clinical use. A human must approve."
- Never log, store or commit API keys. A visitor's key must never be sent to a
  peer site or put in a URL, manifest, prompt or trace.
- Requests to the AI model use an allowlist: only OBX-3 (code and name), OBX-6
  (unit) and OBX-7 (normal range). Never read patient segments (PID, PV1, NK1)
  or notes (NTE) into a request. Nothing from one hospital site goes to another.
- Use the privacy sentence in PLAN.md section 1 word for word; don't write
  "zero PHI", "data never leaves" or "proves" about privacy.
- Never call our validator official or show a pass badge; it is "unofficial,
  static checks only".
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
/research            findings from the research phase (P0)
/profiles/lab-hl7    Dialect Profile: LOINC subset, dialect generator, scorer
/sites/hospital-a    public site: manifest, network JSON, runtime, UI
/sites/hospital-b
/sites/validator     Conformance Validator (unofficial, static checks)
/data                third-party data with its own licence notices (MIMIC ODbL, LOINC)
/evolve              evolution loop and experiment scripts
/docs                brief, README, Devpost text, demo script
DECISIONS.md
```

## Machine notes
- The dev machine has about 7.6 GB RAM and often under 1 GB free. Run one heavy process at a time; do not start Java tools (Synthea) or headless browsers alongside a dev server.
- Python is not installed. Prefer Node scripts.
