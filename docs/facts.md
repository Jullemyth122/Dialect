# Facts (single source)

Every number or claim used in the README, Devpost text, video script or UI is copied from here. Add a source and the date checked. Our own results get added after the experiments run, never before.

## Problem
| Fact | Source | Checked |
|---|---|---|
| HL7 allows heavy customization, so "supports HL7" does not guarantee two systems interoperate | https://digital.ahrq.gov/hl7 | from brief, 20 Nov 2026 |
| Mapping a full local code set to LOINC is slow and costly | https://digital.ahrq.gov/loinc | from brief, 20 Nov 2026 |
| Five hospitals: 14,802 interface codes merged to 4,051 unique LOINC codes | https://hcup-us.ahrq.gov/datainnovations/clinicaldata/RealTimeLOINCTranslationPoster.jsp | from brief, 20 Nov 2026 |

## Prior art
| Fact | Source | Checked |
|---|---|---|
| LabBridge, an LLM agent for LOINC mapping, reports 81% to 90% accuracy | https://www.jmir.org/2026/1/e92499 | from brief, 20 Nov 2026 |
| LLM FHIR mapping study: fine-grained disambiguation is the main limit; use LLMs under human supervision | https://medinform.jmir.org/2026/1/e100368 | from brief, 20 Nov 2026 |

## Real data sources
| Fact | Source | Checked |
|---|---|---|
| MIMIC-IV Clinical Database Demo v1.0 `d_labitems` has 1,630 lab item labels; 269 carry a LOINC code (143 Chemistry, 126 Hematology) | https://doi.org/10.13026/jwtp-v091 (file counted by us) | 24 Nov 2026 |
| MIMIC-IV Demo is licensed ODbL v1.0; tables without patient-level information (`d_` prefix) are included in full | https://physionet.org/content/mimic-iv-demo/1.0/ | 24 Nov 2026 |
| MIMIC-IV Demo v2.2 `d_labitems` has no `loinc_code` column (columns: itemid, label, fluid, category) | https://physionet.org/content/mimic-iv-demo/2.2/ (file checked by us) | 24 Nov 2026 |
| eICU Collaborative Research Database Demo v2.0.1 is licensed ODbL v1.0 | https://physionet.org/content/eicu-crd-demo/2.0.1/ | 24 Nov 2026 |
| LOINC is free to use, copy and distribute; records may be deleted for local needs; field contents may not be changed; local additions must start with "X" | https://loinc.org/license (updated 6 Aug 2026) | 24 Nov 2026 |
| LOINC publishes usage ranks for the top 20,000 codes, replacing the old "Top 2000+" lists | https://loinc.org/usage/obs/ | 24 Nov 2026 |

## LOINC examples used in explanations
| Fact | Source | Checked |
|---|---|---|
| 1558-6 = Fasting glucose [Mass/volume] in Serum or Plasma; 14771-0 = Fasting glucose [Moles/volume] in Serum or Plasma | https://tx.fhir.org/r4/CodeSystem/$lookup?system=http://loinc.org&code=1558-6 (and code=14771-0) | 24 Nov 2026 |
| 2345-7 = Glucose [Mass/volume] in Serum or Plasma; 14749-6 = Glucose [Moles/volume] in Serum or Plasma | same service | 24 Nov 2026 |

## Challenge
| Fact | Source | Checked |
|---|---|---|
| The challenge repo's "Testing" section is a TODO: "Run the validation script to check your submission is compliant" | https://github.com/cognizant-ai-labs/agentic-web | 23 Nov 2026 |
| Judging may use automated AI-driven analysis | https://cognizant-agenticweb.devpost.com/rules | 23 Nov 2026 |

## Our results
None yet. Filled in from `results.json` after P1 and P4.
