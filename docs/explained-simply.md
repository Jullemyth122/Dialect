# Dialect, explained simply

For teammates and reviewers with no healthcare background. No medical knowledge needed. Written Tue 24 Nov 2026; section 4 (how it works, step by step) added Thu 26 Nov.

---

## 1. The 30-second version

Hospitals send lab results (like a blood sugar test) to each other as computer messages. Every hospital names its tests its own way. There is a worldwide "barcode" system for lab tests called **LOINC**, but someone has to match each hospital's own names to those barcodes by hand, test by test. That is slow, and a wrong match can make a result read wrong.

**Dialect is an AI helper that does the matching, says "I'm not sure, please check" instead of guessing, and learns each hospital's naming habits without sending that hospital's test list to other hospitals' websites.** (The AI model it uses sees each test's code, name, unit and normal range, never anything about the patient.)

**What that gives people:**
- **Doctors and nurses** see a referred patient's results from another hospital next to their own, correctly matched, and never a wrong comparison.
- **Patients** see their lab report in plain words, with trusted explanations and questions to ask their doctor.
- **Hospital IT staff** finish the matching work faster, and with a file their systems can use.

**It never gives medical advice.** It explains what a test *is*, never what a result *means* for someone's health. That stays with the doctor.

**Where else it fits** (we build only the hospital referral): hospitals that send samples to outside labs, a hospital switching lab systems, public health offices receiving lab reports, clinical trials, and insurers that score care quality from lab results. All of them receive lab results in someone else's codes.

---

## 2. An everyday comparison: the grocery store

Think of two grocery stores.

- Every product has an official **barcode**. That is the same everywhere.
- But each store writes its **own shelf labels**: Store A writes "Coke 1.5L", Store B writes "CC 1500ml", Store C writes "Cola Lg".
- Now Store A sends Store B a list of what to restock, written with Store A's shelf labels. Store B's system only understands barcodes. Someone has to sit down and match "Coke 1.5L" to the right barcode, line by line.

Hospitals have exactly this problem with lab tests:

| Grocery store | Hospital |
|---|---|
| Official product barcode | **LOINC code**, the worldwide ID for a lab test |
| Store's own shelf label | The hospital's **local test name or code**, like `GLU-F` |
| The restock list sent between stores | A **lab result message** sent between hospitals (the format is called **HL7**) |
| The person matching labels to barcodes | An **interface analyst**, the hospital IT person who connects systems |

That is why the project is called **Dialect**: everyone speaks the same language (the standard), but each hospital has its own dialect.

---

## 3. A real example, step by step

A patient gets a fasting blood sugar test at a small provincial hospital and is then referred to a city hospital.

**What the small hospital's lab sends** (one line of a real-format HL7 message, simplified):

```text
OBX|1|NM|GLU-F^Fasting Glucose^LOCAL||5.6|mmol/L|3.9-5.5|H
```

In plain words: "Test `GLU-F` (fasting glucose, our local code). Result 5.6. Unit mmol/L. Normal range 3.9 to 5.5. Flag: High."

**The problem:** the city hospital has never heard of `GLU-F`. It needs the LOINC code. And here is the tricky part: **the correct code depends on the unit.**

| Same test, different unit | LOINC code | Official name |
|---|---|---|
| Fasting glucose in **mg/dL** | **1558-6** | Fasting glucose [Mass/volume] in Serum or Plasma |
| Fasting glucose in **mmol/L** | **14771-0** | Fasting glucose [Moles/volume] in Serum or Plasma |

(Both checked on a public LOINC lookup service on 24 Nov 2026.)

So 5.6 mmol/L must map to **14771-0**. If someone carelessly maps it to 1558-6, the city hospital's system thinks the value is 5.6 mg/dL, which would be dangerously low instead of slightly high. **A wrong match is worse than no match.** That is the heart of this project.

Now multiply this by thousands of test names per hospital, and every new hospital connection. In one US government project, 5 hospitals had **14,802** different test codes for what were really **4,051** distinct tests.

---

## 4. How Dialect works, step by step

Same example: `GLU-F 5.6 mmol/L, normal 3.9-5.5, flag H` arrives at Hospital B.

1. **Keep only what is needed.** Dialect reads the test code, name, unit and normal range. It never puts the result (5.6) or anything about the patient into an AI request.
2. **Shortlist candidates (plain code, no AI).** It searches the LOINC list for codes that could fit "glucose, fasting": 1558-6 (mg/dL), 14771-0 (mmol/L), 2345-7 (glucose at any time, mg/dL).
3. **The AI picks one, or says "please check".** It sees the shortlist and the clues ("fasting", "mmol/L") and answers "14771-0, confident", or "please check: could be 14771-0 or 2345-7, I can't tell if the patient was fasting".
4. **Plain code double-checks.** A rule (not the AI) checks the unit: an mg/dL code for an mmol/L result is blocked. Safety rules are never left to the AI.
5. **A human approves.** The analyst sees the suggestion in the workbench and approves, fixes or skips. Nothing is saved without a person.
6. **Dialect remembers, for that hospital only.** The approved match goes into Hospital B's private notebook (the alias table): "GLU-F = 14771-0". Next time, no AI is needed, and B's approvals become hints for names it has never seen.
7. **People use the result.** The doctor's referral view lines up both hospitals' results by code (5.6 mmol/L shown beside "about 101 mg/dL"). The patient view fetches a plain explanation from MedlinePlus by the code. The analyst downloads the finished list as a standard file.

**Where the "agentic web" comes in.** Each hospital's website publishes its helper as a public file, like a recipe: which agents exist, what each does, which AI model to use. Hospital B can load Hospital A's recipe after the user agrees, and run it on B's own lab list in B's own browser. B gets A's skill, not A's data, and A never sees B's data. A's recipe starts a bit worse at B, because B names things differently, then improves as B's analyst approves matches.

**Where "evolving" comes in.** Offline, we make about 8 variations of the recipe (different prompt wording, how many candidates the AI sees, how unsure it must be before it says "please check"), score each on cases with known answers, keep the best, mix and tweak them, and repeat for about 10 rounds. Every round is published on the site.

**Who does what:**

| Job | Done by |
|---|---|
| Suggest the code | The AI |
| Shortlist, unit checks, conversions, the privacy filter | Plain code (rules, not AI) |
| Approve every match | The human analyst |
| Explain a test to a patient | MedlinePlus text, never the AI |
| Say what a result means for someone's health | Nobody in Dialect. That is the doctor's job |

---

## 5. How people solve it today

| Way | Problem |
|---|---|
| **By hand**, using a lookup tool (RELMA) | Slow. Every hospital starts from zero |
| **An AI tool** that suggests matches (LabBridge, LARA and others; published research reports 81 to 90% correct) | 1 or 2 in every 10 are wrong, and it doesn't tell you which. Someone still has to check every line. Each hospital learns alone |
| **A company does it for you** | The hospital must send its data to that company |

**Honest note:** AI that matches lab names is not our invention; the tools above already exist. What Dialect adds is section 6: asking instead of guessing, learning at each hospital, sharing the skill (not the data) between hospitals, and evolving it.

---

## 6. What Dialect does differently

**1. It says "I'm not sure" instead of guessing.**
It is scored like a strict exam: **+1** for a right answer, **0** for "please ask a human", **-5** for a confident wrong answer. So it learns that guessing is expensive. The analyst only checks the items it flags, instead of checking everything.

**2. It learns each hospital's habits, at that hospital.**
When the analyst approves a match, Dialect remembers it, for that hospital only. Next time, fewer items need checking. It also uses those approvals as hints for names it has never seen. We measure the two separately, so "it remembered" is never passed off as "it learned".

**3. It is shared openly, and the data stays home.**
The AI helper is published as a public file on a website (an "agentic website", which is what this challenge is about). A hospital opens the page, its browser downloads the helper, and the helper runs right there in that hospital's browser. The hospital's test list and approvals are never sent to the website that published the helper.

An everyday comparison: it is like downloading a recipe from a cooking site and cooking in your own kitchen. The cooking site gets nothing from your fridge.

One honest detail: the helper still asks an AI model for suggestions, so the model sees each test's code, name, unit and normal range. It never sees the patient's name, ID or anything else about the patient; the page shows exactly what is sent before it sends it.

**4. It is tested on real names.**
We test it on 269 real hospital lab test names that already have known LOINC codes, from a free public research dataset (MIMIC-IV Demo), together with the units that hospital really used. The hospitals and patients in our demo are fictional, but those test names and units are real.

We also compare it fairly: against a plain AI that is told it may say "please check" too. If Dialect can't beat that, we will say so.

---

## 7. What each person actually sees

Dialect has three screens, one for each kind of person. All people and patients below are fictional.

### The doctor or nurse: the referral view
Dr. Reyes at the city hospital receives a patient referred from the provincial hospital. Without Dialect, the patient's lab results from the other hospital arrive with unfamiliar names and different units; she has to guess, or order the tests again.

With Dialect she sees one table: each test from both hospitals on the same row, in the same unit, with each lab's own normal range and high/low flag exactly as the lab sent them. Example: the provincial "GLU-F 5.6 mmol/L (H)" appears next to the city hospital's glucose, also shown as about 101 mg/dL. Any test Dialect was not sure about is kept apart under **"Not matched: do not compare"**, so she is never shown a wrong comparison.

Dialect does not tell her what the results mean. That is her job.

### The patient: "My lab report, explained"
Mr. Santos has his lab report and doesn't understand it. He opens the patient page and sees each line in plain words:
- what the test is called in normal language ("Blood sugar, fasting");
- a short explanation of what the test measures, from **MedlinePlus**, the US National Library of Medicine's free health website (not written by AI);
- his number, the lab's normal range, and the lab's own high/low mark;
- questions he can ask his doctor.

It never says "you have diabetes" or "you are fine". Every screen says: **"Not medical advice. Talk to your doctor about your results."** His numbers stay in his browser. In this version he picks from sample reports; uploading real reports is not part of the hackathon. He can print the explained report on one page to bring to his doctor (planned), and, if time allows, have the explanations read aloud or shown in large text.

### The hospital IT person: the review workbench
The user is an interface analyst. We call her Ana in the demo.

1. Ana opens her hospital's Dialect page and loads a batch of lab test names. The page shows her exactly what will be sent to the AI model: test codes, names, units and normal ranges, nothing about patients.
2. Dialect returns them in three piles:
   - **Matched** (confident)
   - **Please check** (unsure, with its top 3 guesses and the reason, e.g. "unit missing, could be 1558-6 or 14771-0")
   - **Unknown**
3. Ana goes through only the "Please check" pile: approve, fix or skip.
4. Every approval is saved for her hospital only. The next batch has a smaller "Please check" pile.
5. When she is done, she downloads the approved list as a standard mapping file (a FHIR ConceptMap, or a spreadsheet-style CSV) that her hospital's interface system can load. This is the real output of her work.
6. If another hospital's Dialect helper is better at certain tests, Ana can load it with one click after a permission prompt. It learns her hospital's habits on her side.

Ana's approvals are what make the doctor's and the patient's screens correct. That is why her screen exists.

---

## 8. Is this really helpful? The honest answer

**What is solidly true:**
- The problem is real and documented by US government health agencies and published research.
- Wrong matches can make a lab result read wrong, so "ask instead of guess" is a real safety idea, not decoration.
- It saves people time only on the part where it is confident. It does not remove the human.
- Doctors get results from other hospitals they can compare; patients get a trusted, plain explanation of what each test is. Neither replaces the doctor's advice.

**What is not proven:**
- We have not tested it inside a real hospital, and we won't before the deadline.
- Our results come from public data and fictional scenarios, not real patients.
- We have not measured whether the doctor and patient screens change real care. That would need a proper study.
- Real hospital use would need testing on real hospital data, a security review and regulatory approval.

**What the honest claim is:** a working demonstration and open tools that show a safer way to do this job, plus a tool (an unofficial conformance validator) that every other challenge entrant can use right away.

---

## 9. Glossary

| Word | Plain meaning |
|---|---|
| **Lab test** | A measurement on a sample, like blood sugar or cholesterol |
| **Unit** | How the number is measured. mg/dL and mmol/L are two ways to measure blood sugar; the same result has different numbers |
| **LOINC** | The worldwide ID system for lab tests, like a barcode |
| **Local code** | A hospital's own short name for a test, like `GLU-F` |
| **HL7 v2** | The common text format hospitals use to send results to each other |
| **FHIR** | A newer, web-style format for health data |
| **Mapping** | Matching a local code to the right LOINC code |
| **Alias table** | A hospital's own saved list of approved matches; it stays with that hospital |
| **ConceptMap** | A standard FHIR file that lists "this local code = that LOINC code", so other systems can load the matches |
| **Interface analyst** | The hospital IT person who connects systems and does the mapping |
| **Abstain** | When the AI says "I'm not sure, please ask a human" |
| **Agentic website** | A website that publishes an AI helper as a public file, which runs in the visitor's browser |
| **Peer site** | Another agentic website whose helper you can borrow, with permission |
| **Private context** | Data the AI helper may use but must not pass to other sites |
| **BYOK** | "Bring your own key": using your own AI account instead of the site's |
| **Synthetic data** | Realistic but made-up data, so no real patient is involved |
| **MedlinePlus** | The US National Library of Medicine's free health information website; much of it is public domain. We show its explanations of lab tests, with credit |
| **Referral** | When one hospital or doctor sends a patient to another |
| **Medical advice** | Telling a person what their results mean for their health or what to do. Dialect never does this |
| **Reference lab** | An outside lab a hospital sends samples to; results come back in that lab's codes |
| **Prior art** | Existing work that already does something similar. We name it ourselves |
| **Evolution** | Making variations of the helper, scoring them, keeping the best and repeating |
| **MIMIC-IV Demo** | A free public research dataset from a US hospital; we use only its list of test names and the unit used for each test, never patient records |
