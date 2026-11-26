// Registers the workbench's operations with the agent runtime (agent-manifest.json,
// "actions.module"). Each action wraps a method the page's own buttons use, so the rules
// live in assets/js/workbench.js, not here. Only names in "actions.agentTools" become
// website_<name> tools.
import { App } from "./assets/js/workbench.js";

const CODE = { type: "string", minLength: 1, maxLength: 32, description: "The hospital's local test code, exactly as website_get_worklist gives it." };

class SiteActions {
  static registerActions(actions) {
    actions.register(SiteActions.getWorklist());
    actions.register(SiteActions.findCandidates());
    actions.register(SiteActions.suggestMapping());
    actions.register(SiteActions.saveMapping());
    actions.register(SiteActions.skipTest());
  }

  static getWorklist() {
    return {
      name: "get_worklist",
      description: "Read the tests on the workbench: each test's local code, name, unit, normal range and review status, the list version, and counts. Never contains result values or patient details. Call it first in each turn that needs the list: the analyst can also change the page.",
      effect: "read",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          status: { type: "string", enum: ["all", "pending", "confident", "check", "approved", "skipped"], description: "Which pile to read. Default all." },
        },
      },
      execute: async (args) => { await App.page.ready; return App.page.getState(args ?? {}); },
    };
  }

  static findCandidates() {
    return {
      name: "find_candidates",
      description: "Get the plain-code shortlist of LOINC codes for one test, with whether each code's unit fits. Choose only from these codes. An empty list means no code here fits: suggest please_check.",
      effect: "read",
      inputSchema: { type: "object", additionalProperties: false, required: ["code"], properties: { code: CODE } },
      execute: async (args) => { await App.page.ready; return App.page.findCandidates(args); },
    };
  }

  static suggestMapping() {
    return {
      name: "suggest_mapping",
      description: "Show a suggestion on the page for one test: a LOINC code from website_find_candidates, with confidence confident or please_check and a short reason. It saves nothing; the analyst approves on the page. The page's unit check moves a confident suggestion to please check when the unit does not fit.",
      // A page-only change the analyst can undo; nothing is saved (see DECISIONS.md, 2026-11-26).
      effect: "write",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["code", "loinc", "confidence", "reason"],
        properties: {
          code: CODE,
          loinc: { type: "string", pattern: "^[0-9]{1,7}-[0-9]$", description: "A LOINC code from website_find_candidates." },
          confidence: { type: "string", enum: ["confident", "please_check"], description: "confident only when one candidate clearly fits both the name and the unit." },
          reason: { type: "string", maxLength: 300, description: "One short sentence: why this code, or why it needs a person." },
        },
      },
      execute: async (args) => { await App.page.ready; return App.page.suggestMapping(args); },
    };
  }

  static saveMapping() {
    return {
      name: "save_mapping",
      description: "Save one approved match to this hospital's alias table. Call it only when the analyst asks to save a specific match. In the same turn, first call website_get_worklist for the current version. The browser asks the analyst to confirm. The site refuses a stale version or a unit that does not fit.",
      effect: "irreversible",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["code", "loinc", "expectedVersion"],
        properties: {
          code: CODE,
          loinc: { type: "string", pattern: "^[0-9]{1,7}-[0-9]$", description: "The LOINC code the analyst agreed to." },
          expectedVersion: { type: "integer", minimum: 0, description: "The version from website_get_worklist in this turn, or from a change made after that read." },
        },
      },
      execute: async (args) => { await App.page.ready; return App.page.saveMapping(args, { by: "assistant, confirmed by the analyst" }); },
    };
  }

  static skipTest() {
    return {
      name: "skip_test",
      description: "Mark one test as skipped when nothing in the list fits and the analyst agrees. The analyst can undo it on the page.",
      effect: "write",
      inputSchema: { type: "object", additionalProperties: false, required: ["code"], properties: { code: CODE } },
      execute: async (args) => { await App.page.ready; return App.page.skipTest(args); },
    };
  }
}

export const registerActions = SiteActions.registerActions;
