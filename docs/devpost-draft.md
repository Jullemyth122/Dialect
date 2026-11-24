# Devpost draft (working copy)

Started Tue 24 Nov 2026. Rewrite at P5 with real results; every number below must come from our experiments or a cited source.

## Title
**Dialect**

## Tagline (Devpost elevator pitch, under 200 characters)
Agent networks that learn each hospital's own lab-code dialect, and ask a human instead of guessing. Shared as open agentic websites; a hospital's lab list never goes to a peer site.

## Short description
Hospitals all use the same lab standards, but each one speaks its own dialect: local codes, units and abbreviations. Matching them to the standard LOINC codes is slow manual work. Dialect is a set of open agentic websites. Each hospital runs a published agent network in the browser that maps its lab messages to LOINC, asks a human when unsure, and learns from the mappings the human approves. A hospital can load a peer's network, with consent, and adapt it to its own codes without sending its lab list or approvals to that peer. The analyst's work ends with a standard FHIR ConceptMap download. Only each test's code, name, unit and normal range go to the AI model; patient fields are never read into a request.

Synthetic data only. Not a clinical tool. A human approves every mapping.

## Section headings (one per judging criterion)
1. Technological Implementation: which spec features we use, the live conformance panel, and our unofficial validator's report
2. Design: the analyst's journey from batch to approved mappings to the ConceptMap download
3. Potential Impact: the problem with sources, results against both single-AI baselines, who uses it, and the shared tools
4. Quality of the Idea: why this needs the open agentic web, not a central service
5. Data and scenarios: real standards and real public lab names and units (MIMIC-IV Demo v1.0, ODbL; LOINC), fictional hospitals and patients, three labelled scenarios
6. Honest limits
7. How it was built during the submission period
