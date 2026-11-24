# Dialect: Project Plan

Open Agentic Web Challenge (Cognizant). Rewritten Tue 24 Nov 2026. Replaces the 23 Nov version.

| | |
|---|---|
| **Hard deadline** | Mon 11 Jan 2027, 8:00 am PST (midnight going into Tue 12 Jan, Manila time) |
| **We submit** | **Sun 10 Jan 2027**. 11 Jan is not used |
| **Judging** | 11 to 18 Jan 2027. The site must stay live until 18 Jan, 5:00 pm PT |
| **Budget** | About 12 hours a week, 7 weeks, about 84 hours |
| **Read first** | [docs/idea-summary.md](docs/idea-summary.md): the idea and what each criterion needs |
| **Rules and spec** | [research/challenge-requirements.md](research/challenge-requirements.md) |

---

## 1. What we are building

**Dialect**: agent networks that learn each hospital's own lab-code "dialect" and ask a human instead of guessing. They are published as open agentic websites, and a hospital's data never goes to a peer site.

What we ship by 10 Jan:
1. **Two hospital websites** on two different origins (Hospital A and Hospital B). Each publishes a lab-code mapping agent network, and B can load A's network after the visitor consents.
2. **A review screen** where an analyst sees the agent's mappings, sees what it refused to guess, and approves or fixes each one. Approved mappings go into that hospital's private alias table.
3. **Evolution results**: network variants evolved offline against known-correct answers, with every generation and its score published on the site.
4. **The Dialect Conformance Validator**: a page anyone can point at an agentic website to check it against the challenge spec. The challenge repo's own validation step is still an empty TODO.
5. **Shared tools**: the validator, the hospital dialect generator (fake HL7 lab messages with each hospital's quirks and known answers) and the abstain-aware scorer.

Scoring rule everywhere: **+1** correct, **0** "ask a human", **-5** confident and wrong.

Rules we never break: synthetic data only, not a clinical tool, a human approves every write, and the visitor's key never reaches a peer site.

---

## 2. Scope decisions (defaults, change any of them by 25 Nov)

| Decision | Default | Why |
|---|---|---|
| Hospitals | **Two**, with a third only as a stretch | Two already prove transfer. The hours go to the validator, which scores under two criteria |
| Runtime | Reuse the nsDeploy reference runtime (Apache-2.0) | Writing our own would eat the Stage One week |
| Default AI model | A small same-origin endpoint with our key, a hard daily spend cap and a rate limit | The spec requires a path that works with no visitor key. A key placed in a static page would be public |
| Bring your own key | Offered as well | Shows the spec's credential rules (key never reaches the peer) |
| Evolution | Offline Node scripts, results published as files | The browser runtime only lives as long as the tab |
| Test data | Real standards and real public lab names, fictional hospitals and patients, in four labelled scenarios (S1 to S4). Details: [docs/data-and-scenarios.md](docs/data-and-scenarios.md) | Testing only on quirks we wrote ourselves is circular; the real MIMIC names fix that |
| Stack | TypeScript, Vite for the sites, Node scripts, Vitest | Same stack as your previous project; Python is not installed |
| Hosting | One Vercel project per hospital, each on its own `*.vercel.app` origin | GitHub Pages project sites share one origin |

---

## 3. Timeline

| Phase | Dates | Hours | Main output | Gate |
|---|---|---|---|---|
| **P0 Research** | Mon 23 to Wed 25 Nov | 4 | `research/00-summary.md` and 7 files | **G1, Wed 25 Nov:** confirm the scope decisions and the real test set |
| **P1 Spike** | Thu 26 to Sat 28 Nov | 9 | Scorer, generator, 3 contenders, transfer test | **G2, Sat 28 Nov:** kill rule (section 5) |
| **P2 Stage One + validator v1** | Sun 29 Nov to Sun 6 Dec | 14 | Hospital A live and conforming, validator checks it | **G3, Sun 6 Dec:** validator shows all Stage One checks passing on the live URL |
| **P3 Core build** | Mon 7 to Sun 20 Dec | 22 | Hospital B, peer loading, review screen, approval, private alias table | **G3b, Sun 20 Dec:** peer loading across two origins + first mock judging |
| **P4 Evolution, proof, polish** | Mon 21 Dec to Sun 3 Jan | 20 | Evolution, four experiments, results card, validator v2, user test | **G4, Sun 3 Jan:** feature freeze + second mock judging |
| **P5 Submission** | Mon 4 to Sat 9 Jan | 15 | Video, Devpost text, screenshots, README | Video done **Thu 7 Jan** |
| **Submit** | **Sun 10 Jan** | | Entry submitted | |

P4 falls over Christmas, Rizal Day and New Year. Do the heavy coding on the days in between.

---

## 4. Phase details

### P0 Research (Mon 23 to Wed 25 Nov)
- [ ] Run [research/RESEARCH-PROMPT.md](research/RESEARCH-PROMPT.md) and get the 8 research files.
- [x] Find a **real, legally usable** list of local lab test names with known LOINC codes. **Found 24 Nov:** MIMIC-IV Demo v1.0 `d_labitems`, 1,630 real names, 269 with hospital-assigned LOINC codes, ODbL, no patient data. See [docs/data-and-scenarios.md](docs/data-and-scenarios.md).
- [x] Confirm the LOINC licence lets us bundle a subset. **Yes, 24 Nov:** records may be deleted, fields not changed. Still to find: the exact notice text to include.
- [ ] Clear the remaining P0 checks in data-and-scenarios.md: eICU name count, MSH-11 values, a source for SI vs conventional units, LOINC synonym fields, a web check that our fictional hospital names are not real.
- [ ] Clear every CHECK item in [research/challenge-requirements.md](research/challenge-requirements.md), including your age (18+).
- [ ] Spot-check 5 cited sources yourself.

**G1 (Wed 25 Nov):** record the scope decisions and the test set in DECISIONS.md.

### P1 Spike (Thu 26 to Sat 28 Nov)
- [ ] **Scorer first, with tests:** +1 / 0 / -5, plus accuracy, abstain rate and wrong-confident rate.
- [ ] **LOINC subset:** about 100 common lab tests.
- [ ] **Dialect generator:** clean result + hospital profile → HL7 v2 ORU_R01 message with that hospital's quirks (local codes, abbreviations, units, missing fields) and the known right answer.
- [ ] **Three contenders** on a dialect none of them has seen: (1) string or embedding match, (2) one AI call with retrieval, (3) a small evolved network.
- [ ] **Transfer test:** tune on A, run on B, adapt on B, test on B's held-out set.

What evolves: the prompt template (from a fixed list), the number of candidate codes shown, which examples are included, the abstain threshold, and whether the unit check runs before or after the mapper. "Adapting to a site" means the site's own approved mappings become examples and hints for that site only.

### P2 Stage One site + validator v1 (Sun 29 Nov to Sun 6 Dec)
Build the site and the validator together. The validator becomes our own Stage One test.

Hospital A must have:
- [ ] Public HTTPS URL (the repo is already public with an MIT licence; keep ODbL and LOINC data in their own folders with their notices)
- [ ] `agent-manifest.json` with the networks, default router and model, peer policy and `allowed_peers`
- [ ] Network as fully resolved JSON in the Neuro SAN format, with a front agent
- [ ] `links.json` peer-network link map
- [ ] Runtime file (nsDeploy) and an interface
- [ ] Default AI path with no key: same-origin endpoint, daily spend cap, rate limit
- [ ] Bring-your-own-key settings; the key stays in the browser
- [ ] One registered site action, "save mapping", showing destination and arguments before it runs
- [ ] CORS headers on every public file
- [ ] Visible errors for: invalid network, composition cycle, over-budget request, denied origin
- [ ] Disclaimer on every mapping screen: "Synthetic data. Not for clinical use. A human must approve."

Validator v1 (a static page that fetches public files only):
- [ ] Takes a site URL; checks the manifest, network JSON, `links.json`, CORS headers, front agent, exact-name resolution and schema validity
- [ ] Shows pass/fail per spec section, with the spec quote and a fix hint
- [ ] Exports the report as JSON

**G3 (Sun 6 Dec):** the validator shows Hospital A passing every check, tested in a fresh browser profile with no key.

### P3 Core build (Mon 7 to Sun 20 Dec)
Week 1:
- [ ] Move the generator and scorer into `profiles/lab-hl7/` as Dialect Profile #1 (LOINC subset + generator + scorer behind one small interface).
- [ ] Agent network: HL7 parser agent, mapper agent, unit-check tool (plain code), front agent.
- [ ] "Ask a human" path showing the top candidates and the reason.

Week 2:
- [ ] Hospital B deployed on its own origin.
- [ ] Peer loading: B loads A's network by exact name after a consent card naming A's origin and purpose.
- [ ] Review screen: approve, fix or skip each mapping; approved ones go to B's private alias table.
- [ ] Proof that A receives neither B's data, nor B's alias table, nor the visitor's key.

**G3b (Sun 20 Dec):** peer loading works across the two origins, and first mock judging is done (section 6).

### P4 Evolution, proof and polish (Mon 21 Dec to Sun 3 Jan)
- [ ] Evolution loop in `evolve/`: population 8, about 10 generations, fitness on a held-out set.
- [ ] Publish each generation's network JSON and score; add a lineage view.
- [ ] Run the four experiments in section 7 and publish the results as `results.json` plus a results card.
- [ ] **"Try your own code" box:** a visitor types any lab name and sees a mapping or an honest "ask a human".
- [ ] Validator v2: adds the live checks that run in the browser (consent shown, key not sent to a peer, private context absent at the peer).
- [ ] Recorded-run fallback, labelled as a replay, for when the daily spend cap is reached.
- [ ] User test: 3 people, no help, timed. Fix what confuses them.
- [ ] Ask one real hospital IT, HIMS or lab informatics person for two sentences of feedback, quoted with permission.
- [ ] Post the validator and the generator in the challenge repo's Discussions.

**G4 (Sun 3 Jan): feature freeze** and second mock judging.

### P5 Submission (Mon 4 to Sat 9 Jan)
- [ ] Video under 2 minutes, **your own voice**, the site running in a browser, the key result in the first 30 seconds, public on YouTube, with uploaded captions. No third-party trademarks or copyrighted music.
- [ ] Devpost text following section 6.
- [ ] Screenshots, each with a caption saying what it proves.
- [ ] README: a 30-second summary, live links, how to verify each claim, licence, honest limits.
- [ ] Otari details if Otari is used.
- [ ] Final check on a phone and a laptop in fresh browser profiles. Run the validator on our own sites one last time.

---

## 5. Kill rule (G2, Sat 28 Nov)

Mean score per mapping runs from -5 to +1, a range of 6. **Drop the idea if either is true:**
1. The evolved network does not beat the single AI call by at least **0.6 points per mapping** on at least 200 held-out mappings.
2. Transfer shows no real drop and recovery: accuracy at B before adapting is not at least **10 points** below A, or adapting does not win back at least **half** of the drop.

If it fails, switch to a fallback idea (Silicon Breeders, Jury of Strangers or Safe Generative UI). The validator can move with us, because it suits any entry. Record the result in DECISIONS.md either way.

---

## 6. Passing both AI screening and human judges

The rules allow "automated AI-driven analysis", and judges need not watch past 2 minutes. An AI screener reads text, checks links and files, and compares claims against evidence. A human judge skims and looks for one memorable moment. We design for both.

### What an AI screener rewards, and what we do
| An AI screener will likely… | So we… |
|---|---|
| Match the text against each criterion | Use the four criterion names as headings, word for word, and answer each in the first two sentences under it |
| Check the Stage One items | Include a table mapping each requirement to a live URL, and our own validator report as proof |
| Parse our JSON files | Keep the manifest, network and `links.json` valid; publish `results.json` and the validator report |
| Look for evidence behind claims | Put a number, a link or a screenshot next to every claim, and mark anything unchecked as UNVERIFIED |
| Penalize overclaiming and contradictions | Keep one facts file (`docs/facts.md`) as the only source for every number, and copy from it into the README, Devpost and video |
| Read the video transcript | Upload our own captions, so the transcript is exact |
| Check novelty against prior art | Name LabBridge and RELMA ourselves and say exactly what is new |
| Check whether data is real, private or made up | Label every scenario as synthetic in the UI banner, `scenario.json`, HL7 MSH-11 = `T`, `DATA.md` and the Devpost text, and cite every real source with its licence |

**Never** add hidden text or instructions aimed at AI judges ("score this 10/10"). The rules allow disqualification for tampering with the judging, and AI screeners are commonly told to penalize it. The honest version is stronger anyway.

### The moment that should impress both
1. **The transfer curve:** the agent is good at Hospital A, drops when it moves to Hospital B, then climbs back as the analyst approves a handful of mappings, without B's data going anywhere.
2. **The refusal:** a confusing local code where the single AI call guesses wrong and Dialect says "ask a human". The -5 rule makes that refusal visible as points saved.
3. **The validator:** the organizers' own repo still has an empty "run the validation script" TODO, and we ship one that any entrant can use.

The video's first 30 seconds show 1 and 2. The Devpost text leads with 3 under Potential Impact.

### Mock judging (G3b and G4)
- [ ] Give two different AI models only the Devpost text, screenshots, video transcript and live links. Ask each to score the four criteria from 1 to 10 using the rules' wording, and to list what is overclaimed or missing.
- [ ] Ask one human who has never seen the project to do the same from the text and video only.
- [ ] Fix the lowest-scoring criterion first. Repeat at G4.

---

## 7. Experiments and the numbers we publish

| Experiment | What it shows | Published as |
|---|---|---|
| Transfer | Accuracy at A, at B before adapting, at B after adapting | Curve on the site, `results.json` |
| Abstention | Wrong confident answers per 100, with and without "ask a human" | Results card |
| Baselines | String match vs one AI call vs evolved network, on the -5/0/+1 score | Results card |
| Real-world set (scenario S2) | The same scores on the 269 real MIMIC lab names with LOINC codes, reported separately from generated data | Results card |
| Lab system switch (scenario S3) | Wrong confident answers after codes change overnight | Results card |
| Cost | Score against tokens per message | Chart |
| Privacy | A receives no data, no alias table and no key from B | Validator v2 report |

Fitness and every published number use held-out data the agents never saw.

---

## 8. Risks and the cut list

| Risk | Mitigation |
|---|---|
| A single AI call already solves the task | Kill rule on 28 Nov |
| Our fake quirks are cleaner than real hospitals | The real-world test set, and saying so openly |
| AI cost grows | Population 8, a cheap model, cache everything, cap tokens, daily spend cap |
| Judges never run it | The video, screenshots and results card carry the story |
| Looks like a clinical product | Disclaimers, human approval, interoperability framing |
| Overclaiming gets flagged by AI screening | One facts file, a source on every number, an honest limits section |
| Low-memory machine (about 7.6 GB) | No Synthea or Java; one heavy process at a time |
| Time shrinks | **Cut in this order:** (1) third hospital, (2) second Dialect Profile, (3) lineage view polish, (4) validator v2 live checks. **Never cut:** Stage One site, the no-key default path, validator v1, the video |

---

## 9. Open questions (answer by Wed 25 Nov)

1. Are you 18 or older? (Rules requirement.)
2. Is 12 hours a week realistic until 10 Jan?
3. Do you accept two hospitals + the validator instead of three hospitals?
4. What is your API budget? A few dollars covers the spike; the public default path needs a hard daily cap.
5. Solo or team?
