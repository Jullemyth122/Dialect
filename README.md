# Dialect

**An AI helper that matches each hospital's own lab test names to the worldwide standard codes, says "please check" instead of guessing, and learns each hospital's habits without that hospital's data leaving it.**

Entry for the [Open Agentic Web Challenge](https://cognizant-agenticweb.devpost.com/) (Cognizant). Deadline Mon 11 Jan 2027, 8:00 am PST; we plan to submit Sun 10 Jan.

> **Synthetic scenario.** Real standards and real public lab test names; fictional hospitals and patients. Not a clinical tool. A human approves every match.

**Status:** planning and research (late November 2026). Nothing is built yet.

---

## New here? Read in this order

| # | File | What you get | Time |
|---|---|---|---|
| 1 | [docs/explained-simply.md](docs/explained-simply.md) | The idea with no medical knowledge needed: a grocery-store comparison, a real example, a glossary | 10 min |
| 2 | [docs/proposal.md](docs/proposal.md) | The pitch: problem, who it helps, what makes it different | 5 min |
| 3 | [docs/idea-summary.md](docs/idea-summary.md) | The whole idea on one page, and what each judging criterion needs | 10 min |
| 4 | [PLAN.md](PLAN.md) | Scope, timeline, tasks, the go/no-go rule, risks | 15 min |

Reviewing with an AI such as Gemini? Use [docs/review-with-ai.md](docs/review-with-ai.md). It lists which files to attach and gives a ready prompt.

## All files

| File | What it is |
|---|---|
| [docs/data-and-scenarios.md](docs/data-and-scenarios.md) | Real data sources, how synthetic data is labelled, the four scenarios |
| [docs/facts.md](docs/facts.md) | The single source for every number and claim, with links |
| [docs/devpost-draft.md](docs/devpost-draft.md) | Title, tagline, description, submission headings |
| [research/challenge-requirements.md](research/challenge-requirements.md) | Challenge rules and spec, checked against the sources |
| [research/RESEARCH-PROMPT.md](research/RESEARCH-PROMPT.md) | Prompt that starts the research phase |
| [DECISIONS.md](DECISIONS.md) | Decisions with dates and reasons |
| [CLAUDE.md](CLAUDE.md) | Rules for the coding agent |
| [docs/brief.md](docs/brief.md) | The original brief (its Otari note is out of date) |

## The idea in four lines
1. Hospitals name lab tests their own way; matching those names to the standard LOINC codes is slow manual work, and a wrong match can make a result read wrong.
2. Dialect suggests matches and is scored +1 right, 0 "please check", -5 confidently wrong, so it asks instead of guessing.
3. Each hospital's approved matches stay with that hospital and make the next batch easier.
4. The helper is published as an open agentic website: anyone can load and inspect it, and it runs in the hospital's own browser.
