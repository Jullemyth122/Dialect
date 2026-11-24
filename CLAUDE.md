# Dialect: rules for the coding agent

Entry for the Open Agentic Web Challenge (Cognizant). Agents that learn each hospital's lab-code "dialect" without private data leaving that hospital's site. The plan is in PLAN.md; background and sources are in docs/brief.md.

## Project rules
- Synthetic data only. Never add real patient or customer data to the repo.
- This is NOT a clinical tool. Every UI screen that shows a mapping must say
  "Synthetic data. Not for clinical use. A human must approve."
- Never log, store or commit API keys. A visitor's key must never be sent to a
  peer site or put in a URL, manifest, prompt or trace.
- Confident wrong mappings are worse than abstaining. Never remove the abstain option.
- Business rules that must hold (unit conversion, valid ranges) run as plain
  code, not as AI instructions.
- Every claim in docs or UI copy needs a source or must be marked UNVERIFIED.
- Keep changes small. Write a test for the scoring function before the agents.
- Record every important decision in DECISIONS.md with the date and the reason.
- Do not add dependencies without checking the licence.

## Data rules (full detail in docs/data-and-scenarios.md)
- Real standards and real public lab names; fictional hospitals and patients.
- From MIMIC-IV Demo v1.0 use only `d_labitems` (no patient-level rows). Keep its ODbL attribution; the extracted test file is ODbL.
- Do not change LOINC field contents; local additions start with "X"; include the LOINC notice.
- Every HL7 message: MSH-11 = `T`; patient IDs like `SYN-000123`, names `SYNTHETIC^PATIENT`.
- Every scenario has a `scenario.json` with `"synthetic": true`, and the UI shows the synthetic-scenario banner.
- Never use a real hospital's name, logo or branding.
- Report results on real names (scenario S2) separately from results on generated data.

## Layout
```text
/research            findings from the research phase (P0)
/profiles/lab-hl7    Dialect Profile: LOINC subset, dialect generator, scorer
/sites/hospital-a    public site: manifest, network JSON, runtime, UI
/sites/hospital-b
/sites/hospital-c
/evolve              evolution loop and experiment scripts
/docs                brief, README, Devpost text, demo script
DECISIONS.md
```

## Machine notes
- The dev machine has about 7.6 GB RAM and often under 1 GB free. Run one heavy process at a time; do not start Java tools (Synthea) or headless browsers alongside a dev server.
- Python is not installed. Prefer Node scripts.
