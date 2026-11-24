# Research prompt (P0)

Paste everything below the line as the first message of the research thread. Source: docs/brief.md, section 3.

---

ROLE
You are a research analyst helping a solo developer decide what to build for the
Open Agentic Web Challenge (https://cognizant-agenticweb.devpost.com/). This is a
RESEARCH phase. Do not write application code. Write findings to files under
./research/ and cite every claim.

PROJECT CONTEXT
Working title: "Dialect". Agents that learn each organization's own data dialect
without moving private data off that organization's website. Base case: hospital
lab messages (HL7 v2 with local codes) mapped to LOINC/FHIR. Agent networks are
evolved and scored against known-correct answers. Score: +1 correct mapping,
0 abstain (ask a human), -5 confident wrong mapping. Agents run in the browser
per the spec at
https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md
It is interoperability plumbing, NOT a clinical tool. Synthetic data only.
A human approves every write.

CONSTRAINTS
- Deadline: Jan 11 2027 8:00am PST. Today is Nov 23 2026. One developer, part-time.
- Judging (4 equal criteria): Technological Implementation (use of the spec),
  Design (complete product, not a proof of concept), Potential Impact (credible,
  specific real problem for a real audience, plus shared tools), Quality of the
  Idea (creative, non-obvious). Judges may judge from text, images and a
  2-minute video alone.
- Stage One is pass/fail: public .json agent network, browser runtime, interface.
- Must be authorized to use any data used. English materials. No third-party
  trademarks in the video.

RULES FOR YOU
1. Every factual claim needs a URL and a date. If you cannot verify, write
   "UNVERIFIED" and say what would verify it.
2. Never invent statistics, quotes, product names or prior art.
3. Label confidence (high/medium/low) on every conclusion.
4. Prefer primary sources: standards bodies, vendor docs, papers, official rules.
5. Time-box: finish in about 6 hours of agent work. Stop and report if blocked.
6. Do not copy long passages. Paraphrase and cite.

RESEARCH QUESTIONS

A. Healthcare problem validation (./research/01-healthcare.md)
 1. Who does HL7 v2 / lab-code-to-LOINC mapping today, how long does it take, and
    what does it cost? Who feels the pain most (small hospitals, labs, HIEs,
    vendors)? Find concrete numbers with sources.
 2. What tools exist today (interface engines, mapping assistants, LLM-based
    research such as LabBridge)? What do they NOT do?
 3. Is "per-site adaptation without moving data" a real gap, or is it solved?
 4. What are the real failure modes of a wrong mapping? Why does abstention matter?
 5. Which Cognizant healthcare products or statements (TriZetto Unify, payer and
    provider businesses) relate to this? Quote briefly, cite.

B. Cross-industry expansion (./research/02-industries.md)
 For each candidate domain in the table of section 2b (A to G), and any better
 domain you find among Cognizant's listed industries:
 - Is there a public standard, and do organizations really use local dialects of
   it? Evidence required.
 - Is there open synthetic or sample data? What licence?
 - Is the mapping checkable against ground truth?
 - Is the data private at each site?
 - Is human integration work expensive today? Evidence.
 - Who is the specific user, and would they plausibly try a free web tool?
 Score each domain 1 to 5 on the 8 criteria of section 2b. Rank them.
 Recommend ONE base domain and ONE optional second domain.

C. Prior art and overlap (./research/03-prior-art.md)
 1. Search for LLM, agentic or evolutionary approaches to schema mapping,
    HL7/FHIR conversion, code mapping, data interoperability. List the closest 10.
 2. Search for any other entry in this challenge: Devpost gallery, GitHub
    discussions, social posts. Report overlaps. If the gallery is not public, say so.
 3. State plainly what is NOT novel, and what might be.

D. Fit with the challenge and the judges (./research/04-fit.md)
 1. Read the full MVP spec, quickstart and examples in the repo. List every
    MUST-level requirement, and map each to a feature of this project.
 2. Read the blog posts and papers of the three judges and Cognizant AI Lab
    (MAKER, CRUSE, Neuro San, Neuro AI Trust, evolutionary AI). Which themes
    could this project honestly connect to? Do not force connections.
 3. Draft the answer to each of the four judging criteria in two sentences.

E. Technical feasibility in the browser (./research/05-feasibility.md)
 1. JavaScript HL7 v2 parsing options, size, licence.
 2. How big is a useful LOINC subset (a few hundred common lab tests)? What are
    LOINC's usage terms? Can a subset be bundled in a public repo?
 3. Synthea and hl7gen: how to produce synthetic ORU_R01 lab messages, and how to
    inject per-hospital quirks (local codes, units, abbreviations, missing fields).
 4. Browser limits: Web Worker use, data size, mid-range phone performance.
 5. How an LLM call is made in the browser under the spec (BYOK, OpenAI-compatible
    router, CORS). What is the cheapest model that can do the mapping reasonably?
 6. Rough API cost estimate for evolving 8 agents x 10 generations x N messages.

F. Safety, data and rules (./research/06-compliance.md)
 1. Confirm no real patient data is needed. List the data sources and licences.
 2. Required disclaimers (not a clinical tool, synthetic data, human approval).
 3. Challenge-rule checklist (new or updated project, data authorization, video
    limits, English, free access for judging).

G. Decision (./research/07-decision.md)
 1. Decision matrix of the top 3 options (base domain choices) scored 1 to 5 on
    the four judging criteria plus build risk and overlap risk.
 2. One recommendation with the strongest counter-argument against it.
 3. A 3-day spike plan with a numeric kill rule.
 4. Top 5 risks and a mitigation for each.

DELIVERABLE
Create ./research/00-summary.md with: the recommendation in 5 lines, the 10 most
important findings with sources, everything marked UNVERIFIED, and the open
questions for the developer. Then stop. Do not start building.
