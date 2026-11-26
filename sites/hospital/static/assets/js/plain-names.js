// Everyday names for the LOINC codes in our subset (our wording, not LOINC's). Screens show
// the standard LOINC name next to or under it.
const PLAIN = {
  "1558-6": "Fasting blood sugar (glucose)", "14771-0": "Fasting blood sugar (glucose)",
  "2345-7": "Blood sugar (glucose)", "14749-6": "Blood sugar (glucose)",
  "2160-0": "Creatinine", "14682-9": "Creatinine", "2951-2": "Sodium", "2823-3": "Potassium",
  "2075-0": "Chloride", "2028-9": "Bicarbonate (total CO2)", "3094-0": "Urea nitrogen (BUN)",
  "2093-3": "Total cholesterol", "14647-2": "Total cholesterol", "2085-9": "HDL cholesterol",
  "2571-8": "Triglycerides", "1975-2": "Total bilirubin", "1742-6": "ALT (alanine aminotransferase)",
  "1920-8": "AST (aspartate aminotransferase)", "17861-6": "Calcium", "718-7": "Hemoglobin",
  "4544-3": "Hematocrit", "6690-2": "White blood cell count", "777-3": "Platelet count", "4548-4": "Hemoglobin A1c",
};

/** @param {{code: string, display: string}} entry a LOINC subset entry */
export const plainName = (entry) => PLAIN[entry.code] ?? entry.display.replace(/\s*\[[^\]]*\]/g, "");
