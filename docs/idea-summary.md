# Dialect: idea summary and the 10/10 playbook

Written Mon 23 Nov 2026. This is the one page to read before working on Dialect. The details are in PLAN.md, research/challenge-requirements.md and docs/brief.md.

---

## Part 1. The idea in full

### The challenge
- **Open Agentic Web Challenge**, run by Cognizant with Mozilla, MIT NANDA, AWS, UT Austin and AI Commons.
- **Build:** an open agentic website. It publishes an agent network as public JSON, runs that network in the visitor's browser, and can load other sites' networks after the visitor agrees.
- **Deadline:** Mon 11 Jan 2027, 8:00 am PST (midnight going into Tue 12 Jan, Manila time). We submit **Sun 10 Jan**.
- **Judges:** Babak Hodjat (Cognizant Chief AI Officer), Ramesh Raskar (MIT, founder of Project NANDA), Risto Miikkulainen (UT Austin, evolutionary AI).
- **Prizes:** $5,000 / $3,000 / $2,000, plus Otari credits.
- **Field:** 1,728 registered as of 23 Nov; the gallery isn't public yet.
- **Judging:** Stage One is pass/fail on spec conformance. Stage Two has four equal criteria: Technological Implementation, Design, Potential Impact and Quality of the Idea. Ties go to Technological Implementation. Judges may judge from the text, screenshots and a 2-minute video alone, and AI-driven analysis is allowed.

### The problem
Hospitals all "speak" the same lab standards (HL7 v2 messages, LOINC test codes, FHIR), but each one has its own dialect: local codes ("GLU", "Gluc", "BS" for glucose), different units, abbreviations and missing fields. "Supports HL7" does not mean two systems understand each other. Matching every local code to LOINC is slow, costly human work: in one AHRQ project, 5 hospitals had 14,802 interface codes that came down to 4,051 unique LOINC codes. Today, interface analysts do this mostly by hand.

### What Dialect does
1. **Each hospital runs its own agentic website.** The site's agent network maps that hospital's lab messages to LOINC.
2. **Three answers only:** a mapping, or **"ask a human"**. Scoring: **+1** correct, **0** abstain, **-5** confident and wrong. A wrong mapping is far worse than asking.
3. **A human approves every write.** An approved mapping goes into the hospital's own alias table, which is private context.
4. **Adaptation at a new site.** Hospital B loads a mapper network from a peer site, after the visitor consents. The network runs in B's browser and learns B's dialect from B's own approved mappings. B's data and alias table never go to the peer site.
5. **Evolution.** Variants of the network (prompt template, number of candidates, examples, abstain threshold, step order) are evolved offline against known-correct answers, then published. Each generation's network and score is visible on the site.
6. **Dialect Profile:** a plug-in format of standard subset + dialect generator + scorer. Hospital labs is profile #1, so the engine could serve other industries.

### Data and scenarios
Real standards and real public lab names; fictional hospitals and patients. The real-world test set is the MIMIC-IV Demo v1.0 lab dictionary: 1,630 real lab names, 269 with LOINC codes assigned by the hospital, openly licensed (ODbL), with no patient data. Four labelled scenarios share one engine:
- **S1** Referral between two hospitals: the transfer demo
- **S2** A real hospital dictionary: the headline real-data result
- **S3** Lab system switch: does it ask instead of guessing when codes change?
- **S4** Public health intake: many dialects at once

Every scenario is marked synthetic in the UI, its JSON, its HL7 messages (MSH-11 = `T`) and the Devpost text. Full detail: [data-and-scenarios.md](data-and-scenarios.md).

### What we claim, and what we don't
- **Claim:** per-site adaptation without sending data to peer sites, plus safe, scored abstention.
- **Don't claim:** "AI maps lab codes". LabBridge already reports 81 to 90%, and RELMA exists.
- **Don't claim:** "data never leaves". Data goes to the model endpoint the site picks, unless that model runs locally.
- **Not a clinical tool.** Synthetic data, a human approves everything, and a disclaimer is on every mapping screen.

### Who it helps
- **Direct users:** interface analysts and lab informatics staff at small and mid-sized hospitals, health information exchanges, public health agencies that receive lab reports from many labs, and integration firms (Cognizant included).
- **Indirect:** clinicians and patients, through lab results that stay correct when records move between hospitals. Say "indirect" every time.

### Why the judges might care
- **Hodjat and Miikkulainen:** evolved agent networks, scored against ground truth. Also Cognizant's healthcare business: TriZetto Unify opened to AI agents in May 2026.
- **Raskar:** agents that cooperate across sites without sharing raw data. Our sites can also register in the NANDA Index for discovery. (The link to his privacy-preserving learning work still needs checking in research.)
- **Cognizant AI Lab:** low error tolerance in healthcare, and their MAKER zero-error work, which fits the -5 penalty for confident errors.

### Plan and gates
P0 Research (23 to 25 Nov) → **G2 kill rule on 28 Nov** → Stage One site and validator v1 by 6 Dec → Hospital B and peer loading by 20 Dec → evolution, proof and polish, feature freeze 3 Jan → video by 7 Jan → submit 10 Jan. About 84 hours at 12 a week.

If the kill rule fails, switch to Silicon Breeders, Jury of Strangers or Safe Generative UI.

### Rules that bind us
- The video has you explaining the project in your own voice (not AI generated), shows the site running in a browser, is under 2 minutes, is public on YouTube, and has no third-party trademarks.
- The project is open source.
- The site must run with no visitor key: a default model path is needed, and bring-your-own-key is extra.
- Required files: `agent-manifest.json`, the network in Neuro SAN JSON format, `links.json`, the runtime and the interface.
- The site stays live until judging ends on 18 Jan.

---

## Part 2. How to aim for 10/10 on every criterion

Nobody can guarantee a 10. Judges score at their own discretion and against the other entries. What we can do is leave each judge no reason to take a point off, and prove every claim with something they can see in 2 minutes or in one screenshot.

Each criterion below has its wording from the rules, what a 10 looks like, and the proof we must produce.

### Technological Implementation
*"How well is the project built, and how effectively does it use the open agentic web specification?"*

A 10 here means every one of the spec's seven interoperability checks (section 6) is shown working, and the code is clean and tested.

Proof to produce:
- [ ] **A live "Conformance" panel on the site** that runs all seven spec checks and shows pass/fail: two-agent network, default router, site action, peer load from a second origin, key never reaching the peer, private context absent at the peer, and the four error stops.
- [ ] **Build the conformance validator and share it.** The challenge repo's "Testing" section is still an empty TODO ("Run the validation script to check your submission is compliant"). A validator other entrants can run is our strongest shared tool. It scores here and under Impact.
- [ ] An observability panel: selected router, contacted origins, agent and tool calls, and cost per run (a SHOULD in spec section 5).
- [ ] Unit tests for the scorer, generator and safety rules; CI on every push; a clean README.
- [ ] Use the reference runtime and the repo's `check_partner.mjs` peer check rather than reinventing them, and say so.

### Design
*"Does the project deliver a complete, coherent product experience, not just a technical proof of concept?"*

A 10 here means one clear job done end to end by a real kind of user, with no dead ends.

Proof to produce:
- [ ] **One story, one journey:** an analyst at Hospital B pastes or loads a batch of messages → the agent proposes mappings → a review queue shows "ask a human" items with top candidates → the analyst approves → the score and the alias table update → B's accuracy visibly rises.
- [ ] First-visit onboarding in three lines, a sample batch button, empty states, and plain error messages.
- [ ] It works with no key, on a phone and a laptop, in a fresh browser.
- [ ] A plain, consistent look across all three hospital sites: one design system, each hospital with its own name and colour.
- [ ] **A test with 3 people** (classmates are fine): give them the task with no help and time it. Fix whatever confuses them. Put "3 first-time users finished the task in under N minutes" in the text.

### Potential Impact
*"A credible, specific case for solving a real problem for a real audience, and does the solution actually address it based on what's demonstrated? Any tools or services built and shared with the community?"*

A 10 here means a named audience, sourced numbers, results on data we didn't invent, a real person's word, and shared tools.

Proof to produce:
- [ ] **Results on a real-world test set** of local lab test names with known LOINC codes (P0 task), not only our generated quirks.
- [ ] A results card in plain numbers. For example: "Of 100 codes, 72 auto-mapped correctly, 25 sent to a human, 3 wrong", next to the single-call baseline.
- [ ] **Feedback from one real practitioner:** a hospital IT, HIMS or lab informatics person in the Philippines (through school or LinkedIn). Even two sentences quoted with permission makes "real audience" credible.
- [ ] **Shared tools, published and linked:** the conformance validator, the Dialect Profile format with the HL7 dialect generator, and the scorer. Post them in the challenge repo's Discussions.
- [ ] Every number in the text has a source link. Mark anything unchecked as UNVERIFIED.

### Quality of the Idea
*"Is this a creative, non-obvious use of an open agentic website, and does the team show genuine understanding of the problem space?"*

A 10 here means a clear answer to "why does this need the agentic web?" and proof that we understand HL7 and LOINC.

Proof to produce:
- [ ] **A "Why not a central service?" paragraph:** with a central SaaS, every hospital uploads its data to one vendor. Here the shared part is the published network, the private part stays at each hospital, and the network learns locally. That is the open agentic web's own model of public networks plus private context.
- [ ] Show real domain detail: HL7 v2 OBX segments, LOINC's six parts (component, property, timing, system, scale, method), unit conversion as plain code, and why -5 for a confident wrong answer.
- [ ] An honest limits section: synthetic quirks are cleaner than real hospitals, and data goes to the chosen model. Being upfront shows understanding.
- [ ] Optional: register the hospital sites in the NANDA Index so peers find each other through it rather than hard-coded links.

### Things that lift every criterion
- [ ] **Write the Devpost text for the AI judge too:** one heading per criterion, with the criterion's wording, exact spec terms (manifest, `links.json`, private context, site action, BYOK, consent), and links to the live proof.
- [ ] **Video first 30 seconds:** the problem in one sentence, then the transfer result (accuracy drops at Hospital B, then recovers) and the abstention result. Judges need not watch past 2 minutes.
- [ ] **Mock judging at G3b (20 Dec) and G4 (3 Jan):** score ourselves with this playbook, and have an agent and one human score us cold from only the text, screenshots and video. Fix the lowest criterion first.

### What this costs
Everything above does not fit in 84 hours with three hospitals. Since 24 Nov the plan's default is **two hospitals plus the validator**: two hospitals still prove transfer, while the validator scores under two criteria. The validator is built in P2 alongside the Stage One site and doubles as our own conformance test.

### AI screening
How we prepare for AI-driven judging (criterion headings word for word, one facts file, evidence next to every claim, valid published JSON, our own captions, no hidden instructions to AI judges) is in PLAN.md section 6.
