# Data and scenarios

Written Tue 24 Nov 2026. This file decides what data Dialect uses, how it is labelled, and which scenarios we show.

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
- **No patient data:** the dataset page says tables without patient-level information (prefixed `d_`) were included in their entirety. We use only `d_labitems`.
- **Licence:** Open Data Commons Open Database License v1.0 (ODbL). Anyone can access the files under that licence.
- **Cite as:** Johnson, A., Bulgarelli, L., Pollard, T., Horng, S., Celi, L. A., & Mark, R. (2022). MIMIC-IV Clinical Database Demo (version 1.0). PhysioNet. https://doi.org/10.13026/jwtp-v091
- **Version note:** version 2.2 (Jan 2023) dropped the `loinc_code` column. We must use **version 1.0**.
- **Caveats to state openly:** the codes were assigned by one hospital and may contain errors of their own; only Chemistry and Hematology carry codes; it is one US hospital from 2022 data.
- **ODbL obligations:** keep the attribution, and release our extracted test file under ODbL (share-alike), separately from our code licence. Note this in the repo's licence section.

### eICU Collaborative Research Database Demo, version 2.0.1
- **What:** lab names from a multi-centre ICU database. They have no LOINC codes, so we use them only as unlabelled real names for the "ask a human" demo.
- **Licence:** ODbL v1.0, open access.
- **To check in P0:** how many distinct lab names it has, and whether the names can be extracted without carrying patient-level rows into the repo (we keep only the distinct name list).

### LOINC
- **Licence (loinc.org/license, updated 6 Aug 2026):** free to use, copy and distribute for commercial or non-commercial use. Records may be **deleted** to meet local needs, so a subset is allowed. **Field contents must not be changed.** Locally added codes must start with "X". LOINC may not be used to build a competing standard.
- **To check in P0:** the exact copyright notice we must include with the subset, and the trademark wording ("LOINC® is a registered trademark of Regenstrief Institute, Inc.").
- **Choosing the subset:** LOINC publishes usage ranks for the top 20,000 codes, replacing the old "Top 2000+" lists (loinc.org/usage/obs). We take the most-used lab codes plus every code in the MIMIC test set.
- **Real synonyms:** LOINC's short names and related-names fields give real abbreviations for the generator. Check the field names in P0.

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
- **Story:** a small provincial hospital refers patients to a city hospital. The provincial lab uses short local abbreviations and SI units. The city lab uses longer names and conventional units.
- **Tests:** transfer. The mapper tuned at the city hospital loses accuracy at the provincial one, then recovers as the analyst approves mappings there.
- **Real anchor:** LOINC codes, real synonyms and the real SI/conventional unit difference.
- **Result shown:** the transfer curve.

### S2. A real hospital dictionary (the headline real-data result)
- **Story:** "Hospital R" is a fictional hospital whose lab dictionary is the **real** MIMIC-IV Demo lab list.
- **Tests:** how the single AI call, string matching and the evolved network score on 269 real names with hospital-assigned LOINC codes, using the +1 / 0 / -5 rule.
- **Real anchor:** the whole test set is real public data (section 2).
- **Result shown:** the results card. This is the number that makes Potential Impact credible.

### S3. Lab system switch
- **Story:** a hospital replaces its lab system. Overnight, many local codes and names change.
- **Tests:** whether the agent notices that its learned mappings no longer fit, and asks a human instead of confidently applying old ones.
- **Real anchor:** real names, with a realistic change pattern (renamed tests, new codes, split panels).
- **Result shown:** wrong confident answers per 100, with and without "ask a human".

### S4. Public health intake
- **Story:** a regional public health office receives results from many small labs, each with its own dialect.
- **Tests:** many dialects at once; the size of the "ask a human" queue and how fast it shrinks.
- **Real anchor:** real multi-centre lab names from the eICU Demo, unlabelled, used for abstention only.
- **Result shown:** the review queue over time.

**Stretch S5:** a second Dialect Profile in another industry, only if everything else is done.

The four scenarios share one engine and one scorer. Adding a scenario means adding one `scenario.json`, one hospital profile and its seed, nothing else.

---

## 5. Quirk catalogue (what the generator does to names and messages)

Each quirk type needs one real example (from MIMIC, LOINC synonyms or a cited paper) before it goes into the generator.

| Quirk | Real example | Status |
|---|---|---|
| Specimen wording ("Whole Blood", "Serum", none) | MIMIC: "Glucose, Whole Blood" | Seen 24 Nov |
| Calculated vs measured | MIMIC: "Hematocrit, Calculated" vs "Hematocrit" | Seen 24 Nov |
| Abbreviations and synonyms | LOINC short names and related names | Check in P0 |
| Units: SI vs conventional | UCUM; international practice | Source needed in P0 |
| Word order and punctuation | MIMIC: "Thyroxine (T4), Free" | Seen 24 Nov |
| Local codes in OBX-3 with no coding system | HL7 v2 practice | Source needed in P0 |
| Truncated names (field length limits) | | UNVERIFIED |
| Typos and spacing | | UNVERIFIED |
| Renamed or split tests after a system change (S3) | | UNVERIFIED |

---

## 6. Rules
- Only dictionary tables (`d_` prefix) from MIMIC; never patient-level rows.
- No real hospital names, real people's names or logos.
- Every scenario is labelled synthetic in the UI, its JSON, its messages and the Devpost text.
- Every real source is cited with version, licence and date checked.
- Results on the real set (S2) are reported separately from results on generated data, never blended.
