# Data and scenarios

Written Tue 24 Nov 2026, updated the same day after the team's review (S1a/S1b, S2a/S2b with real units, S4 moved to stretch). This file decides what data Dialect uses, how it is labelled, and which scenarios we show.

**The principle: real standards and real lab naming, invented hospitals and patients.**
Everything a judge (human or AI) sees must make three things obvious: it is a scenario, the data is synthetic, and it is grounded in real, cited sources.

---

## 1. Three layers of data

| Layer | What it is | Where it comes from | Shown as |
|---|---|---|---|
| **Real** | Standards, codes, units and real lab test names | LOINC, HL7 v2, UCUM, and the public MIMIC-IV Demo lab dictionary (section 2) | "Real, public source" with a citation |
| **Derived** | Hospital dialects built by applying variation patterns seen in real data (abbreviations, units, specimen wording) | Our generator, with each quirk type tied to a real example or marked UNVERIFIED | "Synthetic, based on real patterns" |
| **Invented** | Hospitals, places, patients, result values, message IDs | Our generator | "Fictional" |

No real patient-level data is ever used, downloaded into the repo, or shown.

---

## 2. Real sources (checked 24 Nov 2026)

### MIMIC-IV Clinical Database Demo, version 1.0: our real-world test set
- **What:** the `d_labitems` table, a dictionary of **1,630 real lab item labels** from a US hospital, with fluid and category. **269 of them carry a LOINC code assigned by the hospital** (143 Chemistry, 126 Hematology).
- **Examples:** "Glucose, Whole Blood"; "Hematocrit, Calculated"; "Thyroxine (T4), Free" → 3024-7; "Bilirubin, Total" → 1975-2.
- **No patient data:** the dataset page says tables without patient-level information (prefixed `d_`) were included in their entirety. We use `d_labitems`, plus one table we count ourselves (next point).
- **Real units:** `d_labitems` has no unit column. The demo's lab events table records the unit of every result, and **170 of the 269 coded names** have a recorded unit (3 of them more than one), for example Sodium in mEq/L and Bilirubin, Total in mg/dL. We count the units per test with a Node script and keep only item ID, label, LOINC code and units. No patient IDs, values or times; the downloaded lab events file is deleted after counting. The units table is ODbL like the names.
- **Testing only:** MIMIC rows are never used as examples in prompts or put in published network files. They stay in `data/mimic/` with the ODbL notice, so share-alike does not reach our MIT code.
- **Licence:** Open Data Commons Open Database License v1.0 (ODbL). Anyone can access the files under that licence.
- **Cite as:** Johnson, A., Bulgarelli, L., Pollard, T., Horng, S., Celi, L. A., & Mark, R. (2022). MIMIC-IV Clinical Database Demo (version 1.0). PhysioNet. https://doi.org/10.13026/jwtp-v091
- **Version note:** version 2.2 (Jan 2023) dropped the `loinc_code` column. We must use **version 1.0**.
- **Caveats to state openly:** the codes were assigned by one hospital and may contain errors of their own; only Chemistry and Hematology carry codes; it is one US hospital from 2022 data.
- **ODbL obligations:** keep the attribution, and release our extracted test file under ODbL (share-alike), separately from our code licence. Note this in the repo's licence section.

### eICU Collaborative Research Database Demo, version 2.0.1 (stretch only)
- **What:** lab names from a multi-centre ICU database. They have no LOINC codes, so they would only serve as unlabelled real names for the stretch scenario S4.
- **Licence:** ODbL v1.0, open access.
- **Not used unless S4 is built.** Then check how many distinct names it has, and keep only the distinct name list.

### LOINC
- **Licence (loinc.org/license, updated 6 Aug 2026):** free to use, copy and distribute for commercial or non-commercial use. Records may be **deleted** to meet local needs, so a subset is allowed. **Field contents must not be changed.** Locally added codes must start with "X". LOINC may not be used to build a competing standard.
- **To check in P0:** the exact copyright notice we must include with the subset, and the trademark wording ("LOINC® is a registered trademark of Regenstrief Institute, Inc.").
- **Choosing the subset:** LOINC publishes usage ranks for the top 20,000 codes, replacing the old "Top 2000+" lists (loinc.org/usage/obs). We take the most-used lab codes plus every code in the MIMIC test set.
- **Real synonyms:** LOINC's short names and related-names fields give real abbreviations for the generator. Check the field names in P0.

### MedlinePlus (for the patient view)
- **What:** the US National Library of Medicine's consumer health site. **MedlinePlus Connect** takes a LOINC code and returns links and summaries for patients (checked 24 Nov with 2345-7: it returns "Blood Glucose").
- **Licence:** "Medical test information" and health topic summaries are public domain; credit "Source: MedlinePlus, National Library of Medicine". A.D.A.M. Medical Encyclopedia content is copyrighted: link to it, never copy it.
- **Browser use:** the service sends `Access-Control-Allow-Origin: *`, so the page can call it directly. Limit: at most 100 requests a minute per IP; NLM recommends caching for 12 to 24 hours.
- **What we send:** only the matched LOINC code, never anything about the patient.

### HL7 v2 and units
- Messages use the HL7 v2 lab result structure (ORU^R01).
- **MSH-11 Processing ID** is set to `T` (Training) on every message, so the messages identify themselves as non-production at the standard level. Check the table 0103 values in P0.
- Units follow UCUM. SI units (for example mmol/L) versus conventional units (mg/dL) is a real international difference. Cite a source for it in P0.

---

## 3. How synthetic data is labelled, for people and for AI scanners

1. **Every page that shows data** carries the banner: "Synthetic scenario. Real standards and public lab names; fictional hospitals and patients. Not for clinical use. A human must approve."
2. **Every scenario has a scenario card** in the UI and a matching `scenario.json`, with `"synthetic": true`, the story, which layer each field comes from, sources and licences.
3. **Every HL7 message** has MSH-11 = `T`, facility names that are visibly fictional, and patient identifiers in an obviously fake form (`SYN-000123`, name `SYNTHETIC^PATIENT`).
   - Lab content looks real; identities do not. A realistic-looking patient name could make a scanner think we leaked real records.
4. **A data card** (`DATA.md` in the repo) lists every source, licence, what was extracted, and how the synthetic data is generated.
5. **The Devpost text** has a "Data and scenarios" section with the three-layer table above.
6. **The video** says it in one sentence: "The hospitals and patients are fictional; the lab names and codes come from real public sources."
7. **Fictional names are checked:** before using a hospital or place name, search the web to confirm no real hospital has it. Never use a real hospital's name, logo or branding.

---

## 4. Scenarios

Each scenario is a self-contained story with its own data, its own question and its own result. All are fictional. Names below are placeholders until checked (section 3, rule 7).

### S1. Referral between two hospitals (core demo)
- **Story:** a small provincial hospital (Hospital B) refers patients to a city hospital (Hospital A). The provincial lab uses short local abbreviations and SI units. The city lab uses longer names and conventional units.
- **Tests:** transfer, reported in two parts so that remembering is not mistaken for learning:
  - **S1a, repeat codes:** codes the analyst at B already approved come back. They are answered from B's alias table with no AI call. Shows the work saved.
  - **S1b, new codes:** codes B has never approved. The mapper tuned at A loses accuracy here, then recovers as B's approved mappings become hints. This is the real learning result, and the one the kill rule uses.
- **Real anchor:** LOINC codes, real synonyms and the real SI/conventional unit difference.
- **Result shown:** the S1b transfer curve, plus the S1a work saved.
- **The analyst's input:** each fictional hospital also has a synthetic test catalogue (a CSV of local code, name, unit and normal range) that the workbench uploads in one go. No results or patients are in it.
- **Ask the sender (Could, decided at G3):** if built, the city hospital (A) also acts as the provincial hospital's outside lab: B sends some samples to A, and the results come back in A's codes. A publishes its synthetic test directory as its own public file, the way real reference labs publish their LOINC tables, and B's site asks A's directory agent about those codes. B's lab list is never published.
- **Paper reports (OCR, Could, decided 20 Dec):** if built, the sample photos are of our own synthetic reports, printed and photographed by us, with the synthetic banner visible on the paper. No real report photos.
- **Where people see it:** the referred synthetic patients (`SYN-000123` and a few more) appear in the doctor's **referral view**, with results from both hospitals on one table. The same patients' reports are the samples in the patient view, **"My lab report, explained"**. Result values are generated, plausible and labelled synthetic.

### S2. A real hospital dictionary (the headline real-data result)
- **Story:** "Hospital R" is a fictional hospital whose lab dictionary is the **real** MIMIC-IV Demo lab list.
- **Tests:** how string matching, the two single AI calls and the evolved network score on 269 real names with hospital-assigned LOINC codes, using the +1 / 0 / -5 rule. Two runs:
  - **S2a, names only:** where the right code depends on the unit (like glucose in mg/dL vs mmol/L), the safe answer is "please check".
  - **S2b, names and real units:** the same names with the unit the hospital actually recorded (170 of 269). The plain-code unit check should turn many "please check" answers into correct ones.
- **Real anchor:** the whole test set is real public data (section 2), and it is never used for tuning.
- **Result shown:** a separate real-data card. This is the number that makes Potential Impact credible.

### S3. Lab system switch (Could)
- **Story:** a hospital replaces its lab system. Overnight, many local codes and names change.
- **Tests:** whether the agent notices that its learned mappings no longer fit, and asks a human instead of confidently applying old ones.
- **Real anchor:** real names, with a realistic change pattern (renamed tests, new codes, split panels).
- **Result shown:** wrong confident answers per 100, with and without "please check". Built only if P3 is on time.

**Stretch (cut on 24 Nov, not started before 3 Jan):**
- **S4 Public health intake:** a regional office receiving results from many small labs, using eICU Demo names for "please check" only.
- **S5:** a second Dialect Profile in another industry.

The scenarios share one engine and one scorer. Adding a scenario means adding one `scenario.json`, one hospital profile and its seed, nothing else.

---

## 5. Quirk catalogue (what the generator does to names and messages)

Each quirk type needs one real example (from MIMIC, LOINC synonyms or a cited paper) before it goes into the generator.

| Quirk | Real example | Status |
|---|---|---|
| Specimen wording ("Whole Blood", "Serum", none) | MIMIC: "Glucose, Whole Blood" | Seen 24 Nov |
| Calculated vs measured | MIMIC: "Hematocrit, Calculated" vs "Hematocrit" | Seen 24 Nov |
| Abbreviations and synonyms | LOINC short names and related names | Check in P0 |
| Units: SI vs conventional | UCUM; international practice | Source needed in P0, plus a cited factor for every conversion the referral view shows |
| Word order and punctuation | MIMIC: "Thyroxine (T4), Free" | Seen 24 Nov |
| Local codes in OBX-3 with no coding system | HL7 v2 practice | Source needed in P0 |
| Truncated names (field length limits) | | UNVERIFIED |
| Typos and spacing | | UNVERIFIED |
| Renamed or split tests after a system change (S3) | | UNVERIFIED |

---

## 6. Rules
- From MIMIC, only the dictionary table (`d_labitems`) and the per-test units table we count; never patient-level rows. MIMIC data is for testing only, never in prompts or network files.
- No real hospital names, real people's names or logos.
- Every scenario is labelled synthetic in the UI, its JSON, its messages and the Devpost text.
- Every real source is cited with version, licence and date checked.
- Results on the real set (S2) are reported separately from results on generated data, never blended. S1a and S1b are reported separately too.
