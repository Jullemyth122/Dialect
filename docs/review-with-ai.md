# Reviewing Dialect with an AI (Gemini or any other)

Use this to check two things: (1) does the idea pass the challenge's bar, and (2) can a non-medical reader understand it. Give the AI the files listed below, then paste the prompt.

## Files to give the AI
1. `docs/explained-simply.md`: plain-language explanation
2. `docs/proposal.md`: the pitch
3. `research/challenge-requirements.md`: the rules and spec, checked
4. `docs/data-and-scenarios.md`: data sources and scenarios
5. `PLAN.md`: what will be built and when

If the AI can open links, also give it https://cognizant-agenticweb.devpost.com/rules

## Prompt to paste

```text
You are a strict, independent judge for the Open Agentic Web Challenge
(Cognizant, Devpost). The attached files describe a planned entry called
"Dialect". Nothing is built yet; judge the plan and the idea.

The official judging criteria, equally weighted:
1. Technological Implementation: How well is the project built, and how
   effectively does it use the open agentic web specification?
2. Design: Does the project deliver a complete, coherent product experience,
   not just a technical proof of concept?
3. Potential Impact: Does the project make a credible, specific case for
   solving a real problem for a real audience, and does the solution actually
   address it based on what's demonstrated? Does it include tools or services
   the entrant built and shared with the community?
4. Quality of the Idea: Is this a creative, non-obvious use of an open agentic
   website, and does the team show genuine understanding of the problem space?
Stage One is pass/fail: a public conforming .json agent network, a browser
runtime, and an interface.

Do the following:
A. Explain the project back in 5 plain sentences, as if to someone with no
   healthcare background. If anything in the files confused you, say where.
B. Will the plan pass Stage One? List anything missing.
C. Score each criterion from 1 to 10 as the plan stands, with one sentence
   of reasoning each.
D. For each criterion, name the single change that would raise the score most.
E. List every claim you think is overclaimed, unsupported or contradictory.
F. Name the strongest argument AGAINST this entry winning.
Be critical. Do not be polite at the expense of accuracy.
```

## How to use the answer
- If part A is wrong or vague, the explanation is not clear enough. Fix `docs/explained-simply.md` first.
- Collect the part D and part E answers in a new issue or in DECISIONS.md, with the date.
- Run the same prompt on a second AI model too. Where both agree, act first.
