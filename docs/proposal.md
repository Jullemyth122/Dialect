# Dialect: the proposal

Written Tue 24 Nov 2026. Numbers marked *example* are illustrations until our experiments measure them; every other number is in docs/facts.md with its source.

## In one sentence
Dialect makes lab results readable and comparable wherever they travel: doctors can safely compare a referred patient's results from another hospital, patients can understand their own report, and hospital staff get the matching work done. It does this with a shared AI mapper that learns each hospital's own lab codes, says which matches it is unsure of, never sends the hospital's lab list or approvals to another hospital's site, and never gives medical advice.

## The problem, as it happens in real life
A patient is referred from a small hospital to a bigger one. Their blood test results travel with them as an HL7 message. The small hospital's lab calls fasting glucose `GLU-F`, in mmol/L. The big hospital's system expects its own code, in mg/dL. Unless someone has matched every one of those local codes to the shared LOINC standard, the result arrives unrecognized, lands in the wrong place, or needs someone to re-check it by hand.

Matching them is slow, costly human work. In one AHRQ project, five hospitals had 14,802 different interface codes for what turned out to be 4,051 actual tests. Every new connection between two systems means doing it again.

## Who feels it
- **Doctors and nurses** who receive referred patients: results from another hospital arrive with unfamiliar names and units, so they guess, re-check by hand or repeat the test.
- **Patients**, who get lab reports full of codes and abbreviations and no plain explanation of what each test is.
- **Interface analysts** at small and mid-sized hospitals, often one or two people mapping thousands of codes.
- **Public health offices and health information exchanges**, which receive results from many labs at once, each speaking its own dialect.
- **Integration companies** that do this work for hospitals over and over.
- **Anyone else who receives lab results in someone else's codes:** hospitals using outside reference labs, clinical trials (FDA expects LOINC codes in trial lab data), and insurers computing quality measures (HEDIS uses LOINC value sets). We build only the hospital referral case; sources in docs/facts.md.

## How it is done today, and what is missing
| Today's option | What it lacks |
|---|---|
| **By hand**, with lookup tools such as RELMA | Slow; every hospital starts from zero |
| **AI mappers**: LabBridge (reports 81 to 90% accuracy), LARA, an agentic LOINC coder (2026 research) | Fast, but 10 to 19 in 100 are wrong and the tool does not say which. Someone still has to check everything. Each hospital runs its own copy and learns alone |
| **Central or commercial mapping services** (for example Wolters Kluwer's AI mapping) | The hospital has to send its codes and data to one vendor |

**To be clear: using AI to map lab names to LOINC is not our invention.** What we add is how the skill is shared and improved: published on the open agentic web, adapted at each hospital without either hospital sending its data to the other, and evolved to ask instead of guess. Sources for every tool above are in docs/facts.md.

## What makes Dialect different
1. **It knows when it doesn't know.** A confident wrong answer costs -5 points; asking a human costs nothing. So Dialect only answers when it is sure and flags the rest. The analyst checks the flagged items instead of everything. *Example: out of 1,000 codes, review the 150 it flags instead of all 1,000.*
2. **It learns each hospital's own dialect, at that hospital.** Every mapping the analyst approves becomes that hospital's private knowledge, so the next batch needs fewer checks. We measure this two ways: codes that come back (remembered) and codes it has never seen (learned). Knowledge stays where it was earned.
3. **It is shared as an open agentic website, not sold as a service.** The mapper itself is a public file any hospital can load, inspect and run in its own browser. What is shared is the skill; what stays private is the lab list and the approvals. No vendor, no upload, no account. The AI model sees only each test's code, name, unit and normal range, never patient details.
4. **It proves itself on real names, against a fair rival.** Its results are measured on 269 real hospital lab names with known LOINC codes and their real recorded units (MIMIC-IV Demo, an open public dataset), not only on puzzles we wrote. It is compared with a single AI call that is also told it may say "please check", so the win can't come from an unfair comparison.

## Before and after

**For the analyst**
- **Before:** export the code list, look up each code, guess the ambiguous ones, hope nothing is wrong, start again for the next connection.
- **After:** load the hospital's whole test list (a CSV) or a batch of messages into Dialect. Most codes come back mapped. The unsure ones arrive in a review queue with the top candidates and the reason it is unsure. The analyst approves, fixes or skips, and each approval makes the next batch easier. At the end, they download the approved list as a standard FHIR ConceptMap or a CSV, ready to load into the hospital's interface system.

**For the doctor or nurse**
- **Before:** the referred patient's results from the other hospital are a list of unfamiliar codes in different units.
- **After:** the referral view shows them next to the hospital's own results, matched and converted, each with the lab's own range and flag. Anything uncertain is held apart under "Not matched: do not compare". The clinical judgement stays with them.

**For the patient**
- **Before:** a report that says `GLU-F 5.6 mmol/L H` and nothing else.
- **After:** "Blood sugar, fasting", a short explanation of the test from MedlinePlus (US National Library of Medicine), the lab's normal range and mark, and questions to ask their doctor. No diagnosis, and their numbers stay in their browser.

## Why it matters
In healthcare a wrong mapping is worse than no mapping, because a lab result could be read under the wrong test or unit. Cognizant's own healthcare work stresses that low error tolerance and the need to verify agent output, and Cognizant opened its TriZetto Unify healthcare platform to AI agents on 29 May 2026, while stressing that clinical decisions and oversight stay with people (press release, in docs/facts.md). Dialect's -5 rule turns "verify agent output" into something measured and visible.

## Why an open agentic website is the right shape
The open agentic web says networks are public data and each site's private context stays private. That is exactly the shape of this problem: the mapping skill can be shared openly, while every hospital's codes, patients and approvals must stay home. A central service could not offer that without collecting everyone's data.

## Useful beyond this hackathon
- **The Conformance Validator** (unofficial) lets any entrant check their site's public files against the challenge spec. The official repo's validation step is still a TODO.
- **The dialect generator** produces realistic fake lab messages with known answers, so teams can test interfaces without real patient data.
- **The scorer** (+1 / 0 / -5) is a fair way to grade any AI mapping tool, rewarding honesty over guessing.
- **The same pattern fits other industries** where everyone uses one standard in their own way: insurance claims, bank payment messages, supplier invoices.

## What it is not
Not a clinical tool, not medical advice, not a replacement for the doctor or the analyst, and not tested inside a real hospital. It never interprets results; it shows what each test is and what the lab itself reported. Real use would need testing on real hospital data, a security review and regulatory approval. Hospitals and patients in the demo are fictional; the standards and lab names are real.
