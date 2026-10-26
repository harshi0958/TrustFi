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

  if (aadhaarMatches >= 1) {
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

  const salaryHeaderKeywords = [
    "salary slip",
    "salary statement",
    "salary certificate",
    "salary advice",
    "pay slip",
    "payslip",
    "payroll",
  ];
  const salaryPayKeywords = [
    "basic salary",
    "basic pay",
    "gross salary",
    "gross pay",
    "net salary",
    "net pay",
    "total earnings",
    "earnings",
    "deductions",
    "allowances",
    "house rent allowance",
    "provident fund",
    "professional tax",
    "take home",
  ];
  const salaryEmploymentKeywords = [
    "employee id",
    "employee code",
    "employee name",
    "employee no",
    "pay period",
    "salary month",
    "date of joining",
    "designation",
  ];

  const salaryHeaderMatches =
    salaryHeaderKeywords.filter((word) =>
      normalized.includes(word)
    ).length;
  const salaryPayMatches =
    salaryPayKeywords.filter((word) =>
      normalized.includes(word)
    ).length;
  const salaryEmploymentMatches =
    salaryEmploymentKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (
    (salaryHeaderMatches >= 1 && salaryPayMatches >= 1) ||
    (salaryPayMatches >= 2 && salaryEmploymentMatches >= 1) ||
    salaryPayMatches >= 3
  ) {
    return {
      type: "SALARY_SLIP",
      confidence: Math.min(
        70 +
          salaryHeaderMatches * 8 +
          salaryPayMatches * 5 +
          salaryEmploymentMatches * 4,
        95
      ),
    };
  }

  /*
   * -----------------------------------------
   * BANK PASSBOOK / STATEMENT
   * -----------------------------------------
   */

  const bankAccountKeywords = [
    "account number",
    "account no",
    "a/c number",
    "a/c no",
    "acct number",
    "acct no",
    "ifsc",
    "micr",
    "customer id",
    "cif",
    "savings account",
    "current account",
  ];
  const bankDocumentKeywords = [
    "passbook",
    "account statement",
    "bank statement",
  ];
  const bankContextKeywords = [
    "bank",
    "branch",
  ];
  const bankActivityKeywords = [
    "opening balance",
    "closing balance",
    "available balance",
    "transaction",
    "debit",
    "credit",
    "withdrawal",
    "deposit",
    "cheque",
    "narration",
  ];

  const bankAccountMatches =
    bankAccountKeywords.filter((word) =>
      normalized.includes(word)
    ).length;
  const bankDocumentMatches =
    bankDocumentKeywords.filter((word) =>
      normalized.includes(word)
    ).length;
  const bankContextMatches =
    bankContextKeywords.filter((word) =>
      normalized.includes(word)
    ).length;
  const bankActivityMatches =
    bankActivityKeywords.filter((word) =>
      normalized.includes(word)
    ).length;

  if (
    (bankDocumentMatches > 0 && bankAccountMatches > 0) ||
    (bankAccountMatches > 0 &&
      bankActivityMatches > 0 &&
      (bankContextMatches > 0 || bankActivityMatches >= 2)) ||
    bankAccountMatches >= 2
  ) {
    return {
      type: "BANK_PASSBOOK",
      confidence: Math.min(
        72 +
          bankAccountMatches * 6 +
          bankDocumentMatches * 5 +
          bankActivityMatches * 4,
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

  if (aadhaarNumber) {
    return {
      type: "AADHAAR",
      confidence: 95,
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
      valid: false,
      expectedType,
      detectedType: "SELFIE",
      confidence: 0,
      fraudRisk: 0,
      riskLevel: "LOW",
      reasons: [
        "Selfie is not OCR-verified; identity review is required",
      ],
      extractedData,
    };
  }

  const detected = detectDocumentType(extractedText);

  const reasons: string[] = [];
  let fraudRisk = 0;

  /*
   * -----------------------------------------
   * TYPE MISMATCH
   * -----------------------------------------
   */

  if (
    detected.type !== "UNKNOWN" &&
    detected.type !== expectedType
  ) {
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
    fraudRisk += 100;

    reasons.push(
      extractedText.trim()
        ? "Document type could not be identified from the OCR text. Upload a clear, full-page image of the expected document."
        : "OCR could not read text from this image. Upload a clear, well-lit, full-page image and try again."
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