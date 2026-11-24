# Challenge requirements, checked against the sources

Read on Mon 23 Nov 2026 from:
- Overview: https://cognizant-agenticweb.devpost.com/
- Rules: https://cognizant-agenticweb.devpost.com/rules
- Resources and FAQ: https://cognizant-agenticweb.devpost.com/resources
- Spec: https://github.com/cognizant-ai-labs/agentic-web/blob/main/docs/worldwide_agentic_web_mvp_spec.md (repo Apache-2.0)

Status column: **OK** = the plan already covers it. **FIXED** = added to PLAN.md on 23 Nov. **CHECK** = needs action or confirmation by you.

## Eligibility and rules

| Requirement | Source | Status |
|---|---|---|
| At least the age of majority where you live (18 in the Philippines). Philippines is not on the excluded list | Rules §3 | CHECK: confirm you are 18+ |
| No financial or preferential support from Cognizant | Rules §4 | OK |
| New project, or significantly updated during 11 Nov 2026 to 11 Jan 2027 | Rules §4 | OK: new project |
| Authorized to use every third-party SDK, API and dataset | Rules §4 | MOSTLY OK (24 Nov): LOINC subset allowed, MIMIC-IV Demo and eICU Demo are ODbL. CHECK: exact LOINC notice text |
| Project must be open source ("you can use any model or API, as long as your project itself is open source") | Resources FAQ, Overview | DONE (24 Nov): public repo github.com/Jullemyth122/Dialect, MIT licence; ODbL and LOINC data keep their own licences |
| English materials | Rules §4 | OK |
| Free access for judges until 18 Jan 2027, 5:00 pm PT | Rules §4 | FIXED: the live site must stay up through judging |
| Original work; open source allowed if we build on it and follow its licence | Rules §4 | OK: nsDeploy runtime is Apache-2.0 |

## What to submit

| Requirement | Source | Status |
|---|---|---|
| Public URL of the agentic website | Rules §4 | OK |
| Publicly accessible conforming `.json` agent network | Rules §4 | OK |
| A `runtime` file that runs the network in the browser | Rules §4 | OK |
| An interface for users or agents | Rules §4 | OK |
| Optional interface to configure LLMs and keys | Rules §4 | OK |
| The network interacts with the website, and optionally with other agentic sites | Rules §4 | OK |
| Text description of features | Rules §4 | OK |
| Video under 2 minutes, project running in a browser, on public YouTube | Rules §4 | OK |
| **Video must have you explaining the project, "not AI generated"** | Overview | FIXED: record your own voice, no AI voice |
| No third-party trademarks or copyrighted music in the video | Rules §4 | OK |
| One or more screenshots | Rules §4 | OK |
| If Otari is used: your Otari email, and one or two sentences on a problem you hit and how Otari could improve | Overview | FIXED |

## Spec items our plan missed (Stage One risk)

| Requirement | Spec section | Status |
|---|---|---|
| Network follows the **Neuro SAN** agent-network data model (HOCON, or fully resolved JSON), with a front agent | §2, §3.3 | FIXED |
| `links.json` peer-network link map is one of the minimum public files | §3.3 | FIXED |
| Manifest includes the site's default LLM router metadata and peer policy | §3.3 | FIXED |
| **A default inference path that works with no visitor key.** BYOK is optional; the default path is not. Interop check: "Load and run that network ... with the site's published default router and model" | §4, §6 | FIXED: capped publisher-funded router replaces "replay only" |
| At least one grounded capability: MCP or a registered local site action | §6 | OK: the "save mapping" write action |
| Show destination and arguments before any write | §3.1 | OK |
| Consent before each contact with another origin, naming the origin and purpose | §3.2 | OK |
| Exact-name network match, fail otherwise | §3.2 | OK |
| Visible errors for: invalid network, composition cycle, over-budget request, denied origin | §6 | FIXED: each needs a demo |
| BYOK key never reaches the peer site; peer cannot change the caller's router | §4, §6 | OK |
| Private context absent at the peer unless a field is explicitly allowed | §2.1, §6 | OK |
| Browser runtime is tab-scoped; background or scheduled work needs a hosted service | §1.1 | FIXED: evolution runs as offline scripts; the site publishes the results |
| CORS on all public artifacts | §3.3, §3.4 | OK |

## Facts worth knowing

- 1,728 registered participants on 23 Nov 2026. The project gallery is not published yet. An update on 16 Nov said "a number of you have already submitted entries".
- Judging runs 11 to 18 Jan 2027; winners are announced around 19 Jan. Judging may use "automated AI-driven analysis".
- Tie-break order follows the criteria list: Technological Implementation first.
- The organizers' suggested ideas include a directory or discovery agent, a trust or identity component, and a reusable JS library. The "ideas" discussion category on the repo has more.
- The repo README's "Testing" section is still a TODO: "Run the validation script to check your submission is compliant". No official validator exists yet, so a conformance validator is an open gap we can fill and share.
- The README (checked 23 Nov) says **hosted Otari now allows browser calls**, so a static site can use it, and suggests the model `alibaba/qwen3.8-flash`. This replaces the older note in docs/brief.md that hosted Otari blocks the browser. Free Otari credits are limited to the first 100 registrants, so we probably won't get them.
- Peer linking in the reference examples uses `allowed_peers` and `peer_policy` in the manifest, a `bridge/` page, and `scripts/check_partner.mjs` to check a partner before adding it.
- Spec §1.1: published agent instructions are public by design. Anything confidential must stay server-side behind MCP or a site action.
