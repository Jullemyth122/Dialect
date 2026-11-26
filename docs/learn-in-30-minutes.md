# Learn Dialect's world in 30 minutes

For teammates with no healthcare or hospital-IT background. Written Thu 26 Nov 2026. You don't need medical knowledge: Dialect never does medicine. It only matches names and codes.

---

## 1. The six words you need (5 minutes)

| Word | What it means | Everyday comparison |
|---|---|---|
| **Lab test** | One measurement on a sample, like blood sugar | One item on a receipt |
| **Unit** | How the number is measured: mmol/L or mg/dL for blood sugar | Kilometres vs miles: same distance, different number |
| **Normal range and flag** | The range the lab calls normal, and the lab's own mark: H (high), L (low) | The lab's own note in the margin. Dialect never makes its own |
| **Local code** | A hospital's own short name for a test, like `GLU-F` | A store's own shelf label |
| **LOINC** | The worldwide ID for a lab test, like `14771-0` | A product barcode |
| **Mapping** | Matching a local code to its LOINC code | Matching a shelf label to its barcode |

Two more you'll hear: **HL7** is the text format hospitals use to send results; **"please check"** is Dialect saying "I'm not sure, ask a person".

---

## 2. Practise on a sample report (10 minutes)

A **fictional** printed report from a **fictional** provincial hospital. All values are made up for practice; they are not reference values for real use.

```text
HOSPITAL B - FICTIONAL PROVINCIAL LAB             SYNTHETIC SAMPLE, NOT A REAL PATIENT
Patient: SYNTHETIC PATIENT   ID: SYN-000123       Collected: 2026-11-20 07:10

TEST      DESCRIPTION              RESULT   UNIT     REFERENCE     FLAG
GLU-F     Glucose, fasting         5.6      mmol/L   3.9 - 5.5     H
CREA      Creatinine               88       umol/L   62 - 106
K         Potassium                4.1      mmol/L   3.5 - 5.1
CHOL      Cholesterol, total       5.9      mmol/L   < 5.2         H
HGB       Hemoglobin               14.2     g/dL     13.0 - 17.0
```

Try these with a teammate:
1. **Find the dialect.** Which parts would a city hospital not recognise? (The short codes, and SI units like mmol/L where the city lab uses mg/dL.)
2. **Find the flags.** Which lines did the lab mark? Note: Dialect shows `H` only because the lab wrote it. It never decides high or low itself.
3. **Spot the trap.** If `GLU-F 5.6` were read as mg/dL instead of mmol/L, it would look dangerously low instead of slightly high. That's why a wrong match is worse than "please check".
4. **What would Dialect send to the AI?** Only `GLU-F`, `Glucose, fasting`, `mmol/L`, `3.9 - 5.5`. Never `5.6`, never the patient line.
5. **What would the patient view show?** "Blood sugar, fasting", a MedlinePlus explanation of the test, 5.6 with the lab's range and its `H`, and questions to ask the doctor. Never "you have diabetes".

---

## 3. Follow one line through Dialect (5 minutes)

Read section 4 of [explained-simply.md](explained-simply.md), "How Dialect works, step by step". It follows `GLU-F` from arrival to the doctor's table.

---

## 4. Talk to one real person (10 minutes, this week)

Message a medical technologist (lab staff) or a nurse you know. Ask three questions:
1. "When results come from another hospital or lab, how do they reach you?"
2. "What's annoying or risky about them?" (different names, units, paper?)
3. "Would a side-by-side table with unsure results kept apart help you?"

Write their answer down with the date. With their permission, it becomes our practitioner quote (PLAN.md, P4).

---

## 5. What you can now explain

- Every hospital names tests its own way (its dialect); LOINC is the shared ID.
- Dialect suggests the LOINC code or says "please check"; a person approves.
- Hospitals share the skill, not their data.
- Doctors get a safe side-by-side table; patients get plain words from MedlinePlus.
- Dialect never says what a result means. That's the doctor's job.
