# Facts (single source)

Every number or claim used in the README, Devpost text, video script or UI is copied from here. Add a source and the date checked. Our own results get added after the experiments run, never before.

## Problem
| Fact | Source | Checked |
|---|---|---|
| HL7 allows heavy customization, so "supports HL7" does not guarantee two systems interoperate | https://digital.ahrq.gov/hl7 | from brief, 20 Nov 2026 |
| Mapping a full local code set to LOINC is slow and costly | https://digital.ahrq.gov/loinc | from brief, 20 Nov 2026 |
| Five hospitals: 14,802 interface codes merged to 4,051 unique LOINC codes | https://hcup-us.ahrq.gov/datainnovations/clinicaldata/RealTimeLOINCTranslationPoster.jsp | from brief, 20 Nov 2026 |

## Prior art (AI lab-code mapping is NOT new; name these ourselves)
| Fact | Source | Checked |
|---|---|---|
| LabBridge, an LLM agent for LOINC mapping, reports 81% to 90% accuracy | https://www.jmir.org/2026/1/e92499 | from brief, 20 Nov 2026 |
| LLM FHIR mapping study: fine-grained disambiguation is the main limit; use LLMs under human supervision | https://medinform.jmir.org/2026/1/e100368 | from brief, 20 Nov 2026 |
| An agentic approach: a locally deployed LLM refines queries against the official LOINC Search API to code internal lab tests (BIS 2026) | https://link.springer.com/chapter/10.1007/978-3-032-26363-6_17 | 26 Nov 2026 |
| LARA, presented at the 2026 LOINC Conference: retrieval-augmented mapping of local lab codes to LOINC, with FHIR R4 Bundle export | https://conference.loinc.org/conference/cologne-2026/presentations/ | 26 Nov 2026 |
| A blog post (Nov 2026, opinion, not evidence) proposes almost our mapper design: the model picks from search candidates, a human approves into a FHIR ConceptMap, the agent sees only local code, name, unit and specimen | https://www.clint-johnson.com/articles/llm-loinc-mapping-local-lab-codes | 26 Nov 2026 |
| Wolters Kluwer describes commercial AI lab mapping (LLM plus curated LOINC synonyms); vendor claims | https://wolterskluwer.com/en/expert-insights/labs-and-large-language-models-transforming-healthcare-informatics | 26 Nov 2026 |
| RELMA, Regenstrief's free tool, maps local tests to LOINC (no AI) | https://pmc.ncbi.nlm.nih.gov/articles/PMC4832593 | 26 Nov 2026 |
| A public benchmark exists for VA local lab codes to LOINC (licence not checked; possible extra test set) | https://www.sota2.com/research/sota/medical-code-mapping-on-va-local-laboratory-codes-to-loinc-lp | 26 Nov 2026 |
| **Not found** in 7 searches on 26 Nov: a mapper published as a browser agent network that another hospital loads across origins and adapts without exchanging data, evolved under an abstain-aware score. This is a search result, not proof of novelty | our searches | 26 Nov 2026 |

## Where else local lab codes must become LOINC (for "same engine, other users")
| Fact | Source | Checked |
|---|---|---|
| Reference labs publish LOINC codes for their test catalogues: Mayo Clinic Laboratories (spreadsheet and per-test setup files) and ARUP (spreadsheet) | https://www.mayocliniclabs.com/test-catalog/appendix/LOINC-Codes and https://aruplab.com/testing/resources/loinc_codes | 26 Nov 2026 |
| FDA expects LOINC codes in the CDISC SDTM `LBLOINC` variable for lab data in submissions, for studies starting after 15 Mar 2020 (NDA, ANDA, certain BLA) and 15 Mar 2021 (certain IND) | https://fda.gov/media/109376/download | 26 Nov 2026 |
| HEDIS quality measures for insurers use LOINC-coded lab value sets (e.g. HbA1c tests in the Glycemic Status Assessment measure); current codes come from NCQA | https://portal.ct.gov/-/media/OHS/Quality-Council/2023-Meetings/10-19-23/Glycemic-Status-Assessment-for-Patients-with-Diabetes-GSD.pdf | 26 Nov 2026 |
| Electronic lab reporting to public health needs local codes mapped to a standard such as LOINC; some states require LOINC (e.g. New Jersey) | https://pmc.ncbi.nlm.nih.gov/articles/PMC3953791 and https://nj.gov/health/meaningfuluse/lab-reporting | 26 Nov 2026 |

## AI provider and spec rules on inference
| Fact | Source | Checked |
|---|---|---|
| Spec §4: "A site MAY publish a default router and model that work without a visitor-supplied key"; "A runtime can conform without offering BYOK when the published default inference path runs the network" | https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md | 26 Nov 2026 |
| Challenge README: the visitor pays by default; a site can pay instead with a small proxy and `llm_router.publisher_funded`; "Any OpenAI-compatible provider that accepts calls from a browser ... Pick a model that makes tool calls" | https://github.com/cognizant-ai-labs/agentic-web | 26 Nov 2026 |
| Meta Model API: base URL `https://api.meta.ai/v1`, "drop-in compatible with the OpenAI SDK"; models include `muse-ember-1.0`, `muse-spark-1.3`, `muse-wonder-1.0`; tool calling documented | https://dev.meta.ai/docs/overview | 26 Nov 2026 |
| Meta Model API answered a browser preflight to `/v1/chat/completions` with `Access-Control-Allow-Origin: *` and `access-control-allow-headers: *` | our test call (no key, no data) | 26 Nov 2026 |
| Meta Model API Standard mode: "your content is not used to train Meta models"; Contributor mode (`-contributor` models) gives discounts in exchange for training on prompts and responses | https://dev.meta.ai/docs/pricing-rate-limits | 26 Nov 2026 |
| Rate limit for `muse-ember-1.0`: 3,000 requests a minute per team | https://dev.meta.ai/docs/pricing-rate-limits | 26 Nov 2026 |
| Meta's older hosted Llama API docs now redirect to the Model API; a third-party article says the Llama API shut down on 6 Jul 2026 (not confirmed by Meta) | https://dev.meta.ai/ and https://ecorpit.com/llama-api-sunset-migrate-third-party-host-cost-2026/ | 26 Nov 2026 |

## Used in the sites (26 Nov)
| Fact | Source | Checked |
|---|---|---|
| Labcorp SI factors: glucose mmol/L × 18.02 = mg/dL (mg/dL × 0.0555 = mmol/L); creatinine mg/dL × 88.4 = µmol/L (× 0.0113 back); cholesterol mmol/L × 38.61 = mg/dL (mg/dL × 0.0259 = mmol/L) | https://www.labcorp.com/resource/si-unit-conversion-table | 26 Nov 2026 |
| Meta Model API Standard prices per 1M tokens: Muse Ember $0.10 in / $0.50 out (up to 200K input); Muse Spark 1.1–1.3 $1.25 / $4.25; Muse Wonder $4.00 / $20.00 | https://dev.meta.ai/docs/pricing-rate-limits | 26 Nov 2026 |
| MedlinePlus Connect returns JSON (`feed.entry[].title`, `.link`, `.summary` as HTML) for a LOINC code; 14771-0 returns "Blood Glucose Test" linking to medlineplus.gov/lab-tests/ | our test call | 26 Nov 2026 |
| The challenge's `check_partner.mjs` reports Hospital A's network "can be called from http://localhost:8082" | our local run | 26 Nov 2026 |

## Cognizant context
| Fact | Source | Checked |
|---|---|---|
| Cognizant opened its TriZetto Unify platform to AI agents on 29 May 2026; Electronic Prior Authorization was the first solution; it stresses human oversight of clinical decisions (company press release) | https://news.cognizant.com/2026-05-29-Faster-decisions,-faster-care-for-patients-Cognizant-opens-TriZetto-Unify-to-AI-agents | 26 Nov 2026 |

## Real data sources
| Fact | Source | Checked |
|---|---|---|
| MIMIC-IV Clinical Database Demo v1.0 `d_labitems` has 1,630 lab item labels; 269 carry a LOINC code (143 Chemistry, 126 Hematology) | https://doi.org/10.13026/jwtp-v091 (file counted by us) | 24 Nov 2026 |
| MIMIC-IV Demo is licensed ODbL v1.0; tables without patient-level information (`d_` prefix) are included in full | https://physionet.org/content/mimic-iv-demo/1.0/ | 24 Nov 2026 |
| MIMIC-IV Demo v1.0 `d_labitems` has no unit column; the demo's lab events record a unit for 170 of the 269 LOINC-coded items (3 of them with more than one unit), e.g. Sodium in mEq/L, Bilirubin, Total in mg/dL | https://doi.org/10.13026/jwtp-v091 (`labevents.valueuom` counted by us; no patient rows kept) | 24 Nov 2026 |
| MIMIC-IV Demo v2.2 `d_labitems` has no `loinc_code` column (columns: itemid, label, fluid, category) | https://physionet.org/content/mimic-iv-demo/2.2/ (file checked by us) | 24 Nov 2026 |
| eICU Collaborative Research Database Demo v2.0.1 is licensed ODbL v1.0 | https://physionet.org/content/eicu-crd-demo/2.0.1/ | 24 Nov 2026 |
| LOINC is free to use, copy and distribute; records may be deleted for local needs; field contents may not be changed; local additions must start with "X" | https://loinc.org/license (updated 6 Aug 2026) | 24 Nov 2026 |
| LOINC publishes usage ranks for the top 20,000 codes, replacing the old "Top 2000+" lists | https://loinc.org/usage/obs/ | 24 Nov 2026 |

| MedlinePlus "Medical test information" and health topic summaries are public domain; credit "Source: MedlinePlus, National Library of Medicine"; A.D.A.M. encyclopedia content is copyrighted | https://medlineplus.gov/about/using/usingcontent/ | 24 Nov 2026 |
| MedlinePlus Connect accepts LOINC codes, sends `Access-Control-Allow-Origin: *`, and asks for no more than 100 requests a minute per IP, with 12 to 24 hours of caching | https://medlineplus.gov/medlineplus-connect/technical-information/ (and a test call with 2345-7) | 24 Nov 2026 |

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
| Partners named on the overview page: Mozilla, MIT NANDA, AWS, UT Austin, AI Commons. No ITU or UN body is named | https://cognizant-agenticweb.devpost.com/ | 24 Nov 2026 |
| The challenge has no tracks; it lists suggested ideas | https://cognizant-agenticweb.devpost.com/ | 24 Nov 2026 |

## Our results
None yet. Filled in from `results.json` after P1 and P4.
