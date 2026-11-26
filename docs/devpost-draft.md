# Devpost draft (working copy)

Started Tue 24 Nov 2026. Rewrite at P5 with real results; every number below must come from our experiments or a cited source.

## Title
**Dialect**

## Tagline (Devpost elevator pitch, under 200 characters)
Lab results doctors can compare and patients can understand, wherever they travel. Agents learn each hospital's lab-code dialect, ask a human instead of guessing, and never give medical advice.

## Short description
Hospitals all use the same lab standards, but each one speaks its own dialect: local codes, units and abbreviations. Matching them to the standard LOINC codes is slow manual work. Dialect is a set of open agentic websites. Each hospital runs a published agent network in the browser that maps its lab messages to LOINC, asks a human when unsure, and learns from the mappings the human approves. A hospital can load a peer's network, with consent, and adapt it to its own codes without sending its lab list or approvals to that peer. The analyst's work ends with a standard FHIR ConceptMap download. The same matches power a referral view, where a doctor or nurse sees a referred patient's results from both hospitals side by side with unsure ones held apart, and "My lab report, explained", where a patient reads each test in plain words with MedlinePlus explanations and questions for their doctor. Dialect never interprets results. Only each test's code, name, unit and normal range go to the AI model; patient fields are never read into a request.

AI lab mapping already exists (LabBridge, LARA, RELMA). What Dialect adds is sharing the skill between hospitals on the open agentic web, without sharing their data, and evolving it to ask instead of guess.

Synthetic data only. Not a clinical tool. A human approves every mapping.

## Section headings (one per judging criterion)
1. Technological Implementation: which spec features we use, the live conformance panel, and our unofficial validator's report
2. Design: three people, one product: the analyst's journey from batch to ConceptMap, the doctor's referral view, and the patient's explained report
3. Potential Impact: the problem with sources, results against both single-AI baselines, who uses it, the shared tools, and one sourced sentence on other users of the same engine (reference labs, lab-system switches, public health reporting, clinical trials, insurers)
4. Quality of the Idea: "What exists already, and what's new" first (LabBridge, LARA, the agentic LOINC coder, RELMA; then the one new thing), then why this needs the open agentic web, not a central service
5. Data and scenarios: real standards and real public lab names and units (MIMIC-IV Demo v1.0, ODbL; LOINC), fictional hospitals and patients, three labelled scenarios
6. Honest limits (including: not medical advice, synthetic patients only, no measured effect on real care)
7. How it was built during the submission period
