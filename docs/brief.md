# Dialect: Research Prompt and Project Plan
Open Agentic Web Challenge (Cognizant) · drafted Mon 23 Nov 2026

**Hard deadline:** Mon 11 Jan 2027, 8:00 am PST = **Tue 12 Jan 2027, 12:00 am Manila time**. Plan to submit by Sun 10 Jan.

I do not know how t3code structures plans, so this is plain Markdown. Section 3 is the prompt to paste as the first message. Section 4 is the plan. Section 6 is a rules block you can save as the repo's agent-instructions file.

---

## 1. The idea in one paragraph

**Dialect**: AI agents that learn each organization's own "data dialect" without the private data ever leaving that organization's website. Base case: hospitals that all speak the same standards (HL7 v2, LOINC, FHIR) but each with its own local codes, units and quirks. Agent networks are evolved and scored against known-correct answers. When an agent moves to a new site, it adapts to that site's dialect. The agent is scored +1 for a correct mapping, 0 for abstaining ("ask a human") and -5 for a confident wrong mapping.

Why it fits the challenge: each site publishes an agent network as data, the browser runs it, a peer site can load it after the visitor approves, private context stays private, and writes need human confirmation. All of these are in the MVP spec.

**Honest limits (keep these in every document):**
- Mapping lab codes with LLMs is already published research. Do not pitch "AI maps lab codes." Pitch per-site adaptation without moving data, plus safe abstention.
- This is interoperability plumbing, **not a clinical tool**. Synthetic data only. A human approves every write.

---

## 2. What is already verified (give this to the agent as context)

| Fact | Source |
|---|---|
| Challenge rules, judging criteria, requirements, Stage One is pass/fail | https://cognizant-agenticweb.devpost.com/rules |
| Judging: four equal criteria (Technological Implementation, Design, Potential Impact, Quality of the Idea). Judges may rely only on text, images and video, and need not watch past 2 minutes | same |
| Rules allow "automated AI-driven analysis" as part of judging | same |
| MVP spec: manifest, network JSON, `links.json`, private context (`sly_data`) denied across sites by default, writes need user confirmation, BYOK key never sent to peers | https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md |
| Repo has pizza and guesthouse examples, an `agentify-website` skill, and TODOs for a compliance validator and a "connect to other agentic sites" how-to | https://github.com/cognizant-ai-labs/agentic-web |
| Hosted Otari blocks browser calls. Self-hosted works if the site origin is in `cors_allow_origins` | same repo README |
| Judges: Babak Hodjat, Ramesh Raskar, Risto Miikkulainen | Devpost page |
| Cognizant opened TriZetto Unify (healthcare) to AI agents in May 2026, with policy-governed, auditable, standards-based access | https://news.cognizant.com/2026-05-29-Faster-decisions,-faster-care-for-patients-Cognizant-opens-TriZetto-Unify-to-AI-agents |
| Cognizant's TriZetto paper stresses healthcare's very low error tolerance and the need to monitor and verify agent output | https://www.cognizant.com/en_us/trizetto/documents/cognizant-trizetto-agentic-ai-business-value-with-practical-approach.pdf |
| Mainframe modernization is core business (their page cites 500+ customers, 10,000+ specialists) | https://www.cognizant.com/hu/en/services/cloud-solutions/mainframe-modernization |
| MAKER (million-step zero-error task) by Cognizant AI Lab, Hodjat and Miikkulainen among the authors | https://www.cognizant.com/us/en/ai-lab/blog/maker |
| Neuro AI Trust uses "guardian agents" for governance | https://www.cognizant.com/us/en/ai-lab/neuro-ai-trust |
| HL7 allows heavy customization, so "supports HL7" does not guarantee two systems interoperate | https://digital.ahrq.gov/hl7 |
| Mapping a full local code set to LOINC is slow and costly | https://digital.ahrq.gov/loinc |
| Five hospitals: 14,802 interface codes merged to 4,051 unique LOINC codes | https://hcup-us.ahrq.gov/datainnovations/clinicaldata/RealTimeLOINCTranslationPoster.jsp |
| LabBridge (LLM agent for LOINC mapping): 81% to 90% accuracy. Prior art to beat or differ from | https://www.jmir.org/2026/1/e92499 |
| LLM FHIR mapping study: fine-grained disambiguation is the main limit, use LLMs as assistants under human supervision | https://medinform.jmir.org/2026/1/e100368 |
| Synthetic test data exists: Synthea (Apache-2.0), hl7gen (MIT, about 185 HL7 v2.5 message types) | https://github.com/synthetichealth/synthea · https://pypi.org/project/hl7gen/ |

**Unverified so far:** whether other entrants are building similar things (the Devpost project gallery was not public on 20 Nov), and everything in the cross-industry table below.

---

## 2b. Beyond healthcare: the pattern to test

A domain is a good fit for "dialect adaptation" if most of these are true:
1. A public standard exists.
2. Every organization speaks its own dialect of it.
3. A mapping can be checked against known ground truth.
4. Each site's data is private or sensitive.
5. Errors are costly, so abstaining matters.
6. Synthetic data exists or can be generated.
7. Integration work is currently expensive human labor.
8. It maps to an industry Cognizant serves.

**All rows below are hypotheses. The research phase must verify or kill each one.**

| Domain | Standard | Where the "dialects" would come from (hypothesis) | Cognizant link |
|---|---|---|---|
| A. Hospital labs (base case) | HL7 v2 / LOINC / FHIR | local lab codes, units, abbreviations | Healthcare, TriZetto |
| B. Payer-provider claims and prior auth | X12 837/835, FHIR | payer-specific companion guides | TriZetto Unify (strongest) |
| C. Banking and payments | ISO 20022 | bank- or network-specific usage rules | Banking and financial services |
| D. Insurance | ACORD or similar | carrier-specific field usage | Insurance |
| E. Life sciences | CDISC SDTM | site- and trial-specific source formats | Biopharma |
| F. Retail and manufacturing | GS1 / EDI | supplier-specific catalogs and invoices | Retail, manufacturing |
| G. Legacy flat files | COBOL-style records | undocumented fixed-width files | Mainframe modernization |

**Design rule:** build the engine so a domain is a plug-in **"Dialect Profile"** (standard subset + dialect generator + scorer). Healthcare labs is profile #1. A second profile is a stretch goal that shows generality. The profile format itself is the shared tool for the Potential Impact criterion.

---

## 3. RESEARCH PROMPT (copy everything inside the block)

```text
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
```

---

## 4. Project plan

**Assumption:** about 10 to 15 hours a week, because other big projects are coming. If that is wrong, use the cut list in section 7.

| Phase | Dates (2026-27) | Output | Gate |
|---|---|---|---|
| **P0 Research** | Mon 23 Nov to Wed 25 Nov | `research/00-summary.md` plus 7 files | **G1 (25 Nov):** choose the base domain and decide whether a second profile is realistic |
| **P1 Spike** | Thu 26 Nov to Sat 28 Nov | 3 synthetic hospital dialects, 3 baselines, minimal evolution, transfer test | **G2 (28 Nov):** apply the kill rule |
| **P2 Stage One site** | Sun 29 Nov to Sun 6 Dec | A hand-built, spec-conforming site on a public URL: manifest, network JSON, runtime, interface, BYOK settings | **G3 (6 Dec):** Stage One passes. Keep this URL stable as the fallback entry |
| **P3 Core build** | Mon 7 Dec to Sun 20 Dec | Dialect generator, agent network (parser, mapper, unit-check code tool), scoring, human-approval action, 3 hospital sites | G3b (20 Dec): peer loading works across 2 origins |
| **P4 Evolution and demo** | Mon 21 Dec to Sun 3 Jan | Evolution loop, transfer experiment, lineage view, no-key demo mode, optional second profile | **G4 (3 Jan): feature freeze** |
| **P5 Submission** | Mon 4 Jan to Sat 9 Jan | README, Devpost text (one heading per criterion), screenshots, video under 2 minutes, compliance checklist | Video done by Thu 7 Jan |
| **Submit** | **Sun 10 Jan** | Entry submitted | Do not use 11 Jan |

### Kill rule at G2 (set the numbers before you run it)
Test on a hospital dialect none of the contenders has seen:
1. Plain string or embedding matching against the LOINC subset.
2. One LLM call with retrieval (the LabBridge style).
3. The evolved agent network.

**Drop the idea** (switch to Silicon Breeders, or Jury of Strangers or Safe Generative UI) if either is true:
- Contender 3 does not beat contender 2 on the +1/0/-5 score by a clear margin. Suggested threshold: 10 percent or more of the score range.
- Moving an agent to a new site shows no accuracy drop followed by recovery. Without that, the "dialect adaptation" story is false.

### Experiments the demo depends on
- **Transfer test:** accuracy at Hospital A, then dropped into Hospital B, then after adapting.
- **Abstention test:** wrong confident answers per 100 messages, with and without the abstain option.
- **Cost chart:** score versus tokens per message, to show the trade-off.
- **Privacy check:** show that raw messages never leave a hospital site, and that a peer cannot read the private context.

### Scoring design
- Ground truth comes from your own dialect generator, so the right answer is always known.
- Score per mapping: +1 correct, 0 abstain, -5 wrong and confident.
- Also report accuracy, abstain rate and wrong-confident rate separately, so nothing is hidden.
- Evolution fitness uses a **held-out** set of messages the agents never saw.

---

## 5. Build checklist for the conforming site (Stage One first)

- [ ] Public HTTPS URL (GitHub Pages is fine)
- [ ] `agent-manifest.json` listing the networks
- [ ] Fully resolved network `.json` with a front agent
- [ ] Browser runtime file that runs the network
- [ ] Interface for users or agents
- [ ] Optional settings screen for model and key (BYOK)
- [ ] CORS headers for cross-origin artifacts
- [ ] Peer loading by exact network name, after visible consent
- [ ] Private context stays hidden across sites unless explicitly allowed
- [ ] Write actions require user confirmation
- [ ] Limits on depth, invocations, time and cost, with visible errors
- [ ] **Demo mode so judges can try it without their own API key**

---

## 6. Agent rules block (save as the repo's agent-instructions file)

```text
PROJECT RULES FOR THE CODING AGENT
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
```

Suggested repo layout:
```text
/research            findings from the research phase
/profiles/lab-hl7    Dialect Profile: LOINC subset, dialect generator, scorer
/sites/hospital-a    public site: manifest, network JSON, runtime, UI
/sites/hospital-b
/sites/hospital-c
/evolve              evolution loop and experiment scripts
/docs                README, Devpost text, demo script
DECISIONS.md
```

---

## 7. Risks and the cut list

| Risk | Mitigation |
|---|---|
| A single LLM call already solves the task | The G2 kill rule. Pivot early |
| Synthetic quirks are cleaner than real hospitals | Say so openly. Build quirks from published studies of real code variation |
| LLM cost grows with generations | Small population (8), cheap model, cache results, cap tokens |
| Judges never run it | Make the video carry the story. Lead with the transfer and abstention results |
| Looks like a clinical product | Disclaimers on every screen, human approval, interoperability framing |
| Judging may use automated analysis | One heading per criterion, name the exact spec features used, keep the `.json` valid |
| Time shrinks | **Cut in this order:** (1) second profile, (2) lineage view polish, (3) the third hospital. **Never cut:** the Stage One site, demo mode, the video |

---

## 8. Open questions for you

1. How many hours a week can you really give this, between now and 10 Jan?
2. Is a second industry worth it, or should healthcare labs be the only profile?
3. Do you have an API budget? A few dollars is enough for the spike.
4. Working alone or with a team? The rules allow teams with one representative.
5. Which language do you want the codebase in (JavaScript is the natural fit for the browser runtime)?
