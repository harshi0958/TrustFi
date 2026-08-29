export type DocumentType =
  | "AADHAAR"
  | "PAN"
  | "SALARY_SLIP"
  | "BANK_PASSBOOK"
  | "PROPERTY_DOCUMENT"
  | "GOLD_DOCUMENT"
  | "SELFIE"
  | "UNKNOWN";

export interface DocumentValidationResult {
  valid: boolean;
  expectedType: DocumentType;
  detectedType: DocumentType;
  confidence: number;
  fraudRisk: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];

  extractedData?: {
    name?: string;
    aadhaar?: string;
    pan?: string;
    mobile?: string;
    dob?: string;
  };
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/*
 * -----------------------------------------
 * DOCUMENT TYPE DETECTION
 * -----------------------------------------
 */

export function detectDocumentType(text: string): {
  type: DocumentType;
  confidence: number;
} {
  const normalized = normalize(text);

  /*
   * -----------------------------------------
   * AADHAAR
   * -----------------------------------------
   */

  const aadhaarNumber =
    /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(text);

  const aadhaarKeywords = [
    "aadhaar",
    "aadhar",
    "uidai",
    "unique identification authority",
    "unique identification",
  ];

  const aadhaarMatches =
    aadhaarKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (aadhaarNumber || aadhaarMatches >= 1) {
    return {
      type: "AADHAAR",
      confidence: aadhaarNumber ? 95 : 80,
    };
  }

  /*
   * -----------------------------------------
   * PAN
   * -----------------------------------------
   */

  const panNumber =
    /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i.test(text);

  const panKeywords = [
    "income tax department",
    "permanent account number",
    "e-pan",
  ];

  const panMatches =
    panKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (panNumber || panMatches >= 1) {
    return {
      type: "PAN",
      confidence: panNumber ? 95 : 80,
    };
  }

  /*
   * -----------------------------------------
   * SALARY SLIP
   * -----------------------------------------
   */

  const salaryKeywords = [
    "salary slip",
    "salary statement",
    "salary certificate",
    "basic salary",
    "gross salary",
    "net salary",
    "earnings",
    "deductions",
    "pay slip",
    "payslip",
    "employee id",
    "employee code",
  ];

  const salaryMatches =
    salaryKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (salaryMatches >= 2) {
    return {
      type: "SALARY_SLIP",
      confidence: Math.min(
        60 + salaryMatches * 8,
        95
      ),
    };
  }

  /*
   * -----------------------------------------
   * BANK PASSBOOK / STATEMENT
   * -----------------------------------------
   */

  const bankKeywords = [
    "account number",
    "ifsc",
    "branch",
    "bank",
    "statement",
    "opening balance",
    "closing balance",
    "transaction",
    "debit",
    "credit",
  ];

  const bankMatches =
    bankKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (bankMatches >= 3) {
    return {
      type: "BANK_PASSBOOK",
      confidence: Math.min(
        60 + bankMatches * 7,
        95
      ),
    };
  }

  /*
   * -----------------------------------------
   * PROPERTY DOCUMENT
   * -----------------------------------------
   */

  const propertyKeywords = [
    "property",
    "sale deed",
    "sale agreement",
    "agreement of sale",
    "registered deed",
    "property deed",
    "land",
    "plot",
    "survey number",
    "survey no",
    "registration",
    "registrar",
    "sub registrar",
    "stamp duty",
    "built up area",
    "carpet area",
    "property address",
    "ownership",
  ];

  const propertyMatches =
    propertyKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (propertyMatches >= 3) {
    return {
      type: "PROPERTY_DOCUMENT",
      confidence: Math.min(
        55 + propertyMatches * 7,
        95
      ),
    };
  }

  /*
   * -----------------------------------------
   * GOLD DOCUMENT
   * -----------------------------------------
   */

  const goldKeywords = [
    "gold",
    "gold loan",
    "gold jewellery",
    "jewellery",
    "jewelry",
    "ornament",
    "ornaments",
    "karat",
    "carat",
    "purity",
    "22k",
    "24k",
    "weight",
    "gross weight",
    "net weight",
    "gold valuation",
    "valuation report",
  ];

  const goldMatches =
    goldKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (goldMatches >= 3) {
    return {
      type: "GOLD_DOCUMENT",
      confidence: Math.min(
        55 + goldMatches * 7,
        95
      ),
    };
  }

  /*
   * -----------------------------------------
   * UNKNOWN
   * -----------------------------------------
   */

  return {
    type: "UNKNOWN",
    confidence: 0,
  };
}

/*
 * -----------------------------------------
 * DOCUMENT VALIDATION
 * -----------------------------------------
 */

export function validateDocument(
  expectedType: DocumentType,
  extractedText: string,
  extractedData?: DocumentValidationResult["extractedData"]
): DocumentValidationResult {

  /*
   * Selfie is not an OCR document.
   * It should be handled separately by frontend.
   */

  if (expectedType === "SELFIE") {
    return {
      valid: true,
      expectedType,
      detectedType: "SELFIE",
      confidence: 100,
      fraudRisk: 0,
      riskLevel: "LOW",
      reasons: [
        "Selfie accepted for identity verification",
      ],
      extractedData,
    };
  }

  const detected =
    detectDocumentType(extractedText);

  const reasons: string[] = [];

  let fraudRisk = 0;

  /*
   * -----------------------------------------
   * TYPE MISMATCH
   * -----------------------------------------
   */

  if (detected.type !== expectedType) {
    fraudRisk += 60;

    reasons.push(
      `Expected ${expectedType}, but detected ${detected.type}`
    );
  }

  /*
   * -----------------------------------------
   * UNKNOWN
   * -----------------------------------------
   */

  if (detected.type === "UNKNOWN") {
    fraudRisk += 40;

    reasons.push(
      "Document type could not be identified"
    );
  }

  /*
   * -----------------------------------------
   * LOW CONFIDENCE
   * -----------------------------------------
   */

  if (
    detected.type !== "UNKNOWN" &&
    detected.confidence < 70
  ) {
    fraudRisk += 20;

    reasons.push(
      "Document classification confidence is low"
    );
  }

  /*
   * -----------------------------------------
   * FINAL VALIDATION
   * -----------------------------------------
   */

  const valid =
    detected.type === expectedType &&
    detected.confidence >= 70;

  /*
   * -----------------------------------------
   * RISK LEVEL
   * -----------------------------------------
   */

  const riskLevel =
    fraudRisk >= 60
      ? "HIGH"
      : fraudRisk >= 30
      ? "MEDIUM"
      : "LOW";

  return {
    valid,
    expectedType,
    detectedType: detected.type,
    confidence: detected.confidence,
    fraudRisk: Math.min(fraudRisk, 100),
    riskLevel,
    reasons,
    extractedData,
  };
}