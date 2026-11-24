# Dialect: the proposal

Written Tue 24 Nov 2026. Numbers marked *example* are illustrations until our experiments measure them; every other number is in docs/facts.md with its source.

## In one sentence
Dialect lets any hospital load a shared AI mapper that learns its own lab codes, tells the analyst exactly which mappings it is unsure of, and never sends the hospital's lab list or approvals to another hospital's site.

## The problem, as it happens in real life
A patient is referred from a small hospital to a bigger one. Their blood test results travel with them as an HL7 message. The small hospital's lab calls fasting glucose `GLU-F`, in mmol/L. The big hospital's system expects its own code, in mg/dL. Unless someone has matched every one of those local codes to the shared LOINC standard, the result arrives unrecognized, lands in the wrong place, or needs someone to re-check it by hand.

Matching them is slow, costly human work. In one AHRQ project, five hospitals had 14,802 different interface codes for what turned out to be 4,051 actual tests. Every new connection between two systems means doing it again.

## Who feels it
- **Interface analysts** at small and mid-sized hospitals, often one or two people mapping thousands of codes.
- **Public health offices and health information exchanges**, which receive results from many labs at once, each speaking its own dialect.
- **Integration companies** that do this work for hospitals over and over.

## How it is done today, and what is missing
| Today's option | What it lacks |
|---|---|
| **By hand**, with lookup tools such as RELMA | Slow; every hospital starts from zero |
| **AI mappers** (LabBridge reports 81 to 90% accuracy) | Fast, but 10 to 19 in 100 are wrong and the tool does not say which. Someone still has to check everything |
| **Central mapping services** | The hospital has to send its codes and data to one vendor |

## What makes Dialect different
1. **It knows when it doesn't know.** A confident wrong answer costs -5 points; asking a human costs nothing. So Dialect only answers when it is sure and flags the rest. The analyst checks the flagged items instead of everything. *Example: out of 1,000 codes, review the 150 it flags instead of all 1,000.*
2. **It learns each hospital's own dialect, at that hospital.** Every mapping the analyst approves becomes that hospital's private knowledge, so the next batch needs fewer checks. We measure this two ways: codes that come back (remembered) and codes it has never seen (learned). Knowledge stays where it was earned.
3. **It is shared as an open agentic website, not sold as a service.** The mapper itself is a public file any hospital can load, inspect and run in its own browser. What is shared is the skill; what stays private is the lab list and the approvals. No vendor, no upload, no account. The AI model sees only each test's code, name, unit and normal range, never patient details.
4. **It proves itself on real names, against a fair rival.** Its results are measured on 269 real hospital lab names with known LOINC codes and their real recorded units (MIMIC-IV Demo, an open public dataset), not only on puzzles we wrote. It is compared with a single AI call that is also told it may say "please check", so the win can't come from an unfair comparison.

## Before and after, for one analyst
- **Before:** export the code list, look up each code, guess the ambiguous ones, hope nothing is wrong, start again for the next connection.
- **After:** load the hospital's batch into Dialect. Most codes come back mapped. The unsure ones arrive in a review queue with the top candidates and the reason it is unsure. The analyst approves, fixes or skips, and each approval makes the next batch easier. At the end, they download the approved list as a standard FHIR ConceptMap or a CSV, ready to load into the hospital's interface system.

## Why it matters
In healthcare a wrong mapping is worse than no mapping, because a lab result could be read under the wrong test or unit. Cognizant's own healthcare work stresses that low error tolerance and the need to verify agent output, and Cognizant opened its TriZetto Unify healthcare platform to AI agents in May 2026. Dialect's -5 rule turns "verify agent output" into something measured and visible.

## Why an open agentic website is the right shape
The open agentic web says networks are public data and each site's private context stays private. That is exactly the shape of this problem: the mapping skill can be shared openly, while every hospital's codes, patients and approvals must stay home. A central service could not offer that without collecting everyone's data.

## Useful beyond this hackathon
- **The Conformance Validator** (unofficial) lets any entrant check their site's public files against the challenge spec. The official repo's validation step is still a TODO.
- **The dialect generator** produces realistic fake lab messages with known answers, so teams can test interfaces without real patient data.
- **The scorer** (+1 / 0 / -5) is a fair way to grade any AI mapping tool, rewarding honesty over guessing.
- **The same pattern fits other industries** where everyone uses one standard in their own way: insurance claims, bank payment messages, supplier invoices.

## What it is not
Not a clinical tool, not a replacement for the analyst, and not tested inside a real hospital. Real use would need testing on real hospital data, a security review and regulatory approval. Hospitals and patients in the demo are fictional; the standards and lab names are real.
