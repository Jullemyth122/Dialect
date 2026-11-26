# Demo walkthrough: one result from Hospital B to Hospital A

Also on the site: **How it works** (`/guide.html`) on either hospital.

Start both sites: `npm run build`, then `npm run serve:a` (http://127.0.0.1:8081) and `npm run serve:b` (http://localhost:8082). Open them in two tabs.

| Step | Who | Real hospital | In the demo | Where |
|---|---|---|---|---|
| 1. List the lab's tests | Lab / IT analyst, Hospital B | Export the test list (code, name, unit, range) from the lab system, or collect sample HL7 messages; load into a mapping tool such as RELMA | Sample list loads by itself; or **Upload a CSV**, or **+ Add a test by hand** | B · Lab & IT |
| 2. Match to LOINC | Same | Analyst searches LOINC and picks a code per test, by hand, starting with the most-used tests | Each row shows a suggested code (a name match, or AI if a Meta key is connected): **Approve / Change / Skip**. Approve GLU-F, CREA and K at least | B · Lab & IT |
| 3. Send results | Hospital B's interface engine (automatic) | An HL7 ORU^R01 message; OBX-3 carries the local code and the LOINC code side by side | **Send results**: fill with sample results or type them; see the HL7 message; **Download the file** | B · Send results |
| 4. Receive and line up | Doctor / nurse, Hospital A | The EHR reads the LOINC codes; unmapped results arrive as text | **Open a received file**: approved tests line up with A's earlier results in A's units; the rest go under "do not compare" | A · Doctors & nurses |
| 5. Patient reads it | Patient | Patient app | Plain test names, the lab's range bar, MedlinePlus explanation; no AI | Patients |

What moves between the sites: only the downloaded file (synthetic patient, results, local codes, approved LOINC codes). B's test list, approvals (the alias table) and any AI key stay in B's browser.

Try the contrast: send once before approving anything (everything lands in "do not compare"), then approve and send again.

Sources: [LOINC mapping FAQ](https://loinc.org/kb/faq/mapping/), [RELMA overview](https://loinc.org/kb/relma/overview), [CDPH ELR HL7 guide](https://www.cdph.ca.gov/Programs/CID/DCDC/CDPH%20Document%20Library/CDPH-Electronic-Lab-Reporting-HL7-Specifications-Guide.pdf) (OBX-3 local + standard triplets), [AHRQ on LOINC](https://digital.ahrq.gov/loinc).
