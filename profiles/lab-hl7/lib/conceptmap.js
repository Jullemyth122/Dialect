// Builds a FHIR R4 ConceptMap from a hospital's approved mappings.

/**
 * @param {{id:string, name:string, siteUrl:string, codeSystem:string}} hospital
 * @param {Array<{code:string, name:string, loinc:string, display:string}>} approved
 * @param {Date} [now]
 * @returns {object} a FHIR R4 ConceptMap resource
 */
export function toConceptMap(hospital, approved, now = new Date()) {
  return {
    resourceType: "ConceptMap",
    id: `dialect-${hospital.id}-lab-to-loinc`,
    url: `${hospital.siteUrl.replace(/\/$/, "")}/fhir/ConceptMap/dialect-${hospital.id}-lab-to-loinc`,
    name: `Dialect${hospital.id.replace(/[^a-z0-9]/gi, "")}LabToLoinc`,
    title: `${hospital.name}: local lab codes to LOINC (synthetic demo)`,
    status: "draft",
    experimental: true,
    date: now.toISOString(),
    description: "Synthetic demonstration data. Not for clinical use. Every mapping was approved by a person in the Dialect review workbench.",
    sourceUri: hospital.codeSystem,
    targetUri: "http://loinc.org",
    group: [
      {
        source: hospital.codeSystem,
        target: "http://loinc.org",
        element: approved.map((m) => ({
          code: m.code,
          display: m.name,
          target: [{ code: m.loinc, display: m.display, equivalence: "equivalent" }],
        })),
      },
    ],
  };
}
