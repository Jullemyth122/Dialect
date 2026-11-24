# Dialect, explained simply

For teammates and reviewers with no healthcare background. No medical knowledge needed. Written Tue 24 Nov 2026.

---

## 1. The 30-second version

Hospitals send lab results (like a blood sugar test) to each other as computer messages. Every hospital names its tests its own way. There is a worldwide "barcode" system for lab tests called **LOINC**, but someone has to match each hospital's own names to those barcodes by hand, test by test. That is slow, and a wrong match can make a result read wrong.

**Dialect is an AI helper that does the matching, says "I'm not sure, please check" instead of guessing, and learns each hospital's naming habits without sending that hospital's test list to other hospitals' websites.** (The AI model it uses sees each test's code, name, unit and normal range, never anything about the patient.)

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

## 4. How people solve it today

| Way | Problem |
|---|---|
| **By hand**, using a lookup tool | Slow. Every hospital starts from zero |
| **An AI tool** that suggests matches (published research reports 81 to 90% correct) | 1 or 2 in every 10 are wrong, and it doesn't tell you which. Someone still has to check every line |
| **A company does it for you** | The hospital must send its data to that company |

---

## 5. What Dialect does differently

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

## 6. What a user actually sees

The user is an interface analyst. We call her Ana in the demo; she is fictional.

1. Ana opens her hospital's Dialect page and loads a batch of lab test names. The page shows her exactly what will be sent to the AI model: test codes, names, units and normal ranges, nothing about patients.
2. Dialect returns them in three piles:
   - **Matched** (confident)
   - **Please check** (unsure, with its top 3 guesses and the reason, e.g. "unit missing, could be 1558-6 or 14771-0")
   - **Unknown**
3. Ana goes through only the "Please check" pile: approve, fix or skip.
4. Every approval is saved for her hospital only. The next batch has a smaller "Please check" pile.
5. When she is done, she downloads the approved list as a standard mapping file (a FHIR ConceptMap, or a spreadsheet-style CSV) that her hospital's interface system can load. This is the real output of her work.
6. If another hospital's Dialect helper is better at certain tests, Ana can load it with one click after a permission prompt. It learns her hospital's habits on her side.

---

## 7. Is this really helpful? The honest answer

**What is solidly true:**
- The problem is real and documented by US government health agencies and published research.
- Wrong matches can make a lab result read wrong, so "ask instead of guess" is a real safety idea, not decoration.
- It saves people time only on the part where it is confident. It does not remove the human.

**What is not proven:**
- We have not tested it inside a real hospital, and we won't before the deadline.
- Our results come from public data and fictional scenarios, not real patients.
- Real hospital use would need testing on real hospital data, a security review and regulatory approval.

**What the honest claim is:** a working demonstration and open tools that show a safer way to do this job, plus a tool (an unofficial conformance validator) that every other challenge entrant can use right away.

---

## 8. Glossary

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
| **MIMIC-IV Demo** | A free public research dataset from a US hospital; we use only its list of test names and the unit used for each test, never patient records |
