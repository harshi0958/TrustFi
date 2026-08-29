import Tesseract from "tesseract.js";

export type DocumentType =
  | "AADHAAR"
  | "PAN"
  | "SALARY_SLIP"
  | "BANK_PASSBOOK"
  | "PROPERTY_DOCUMENT"
  | "GOLD_DOCUMENT"
  | "SELFIE";

export async function extractText(
  imagePath: string,
  expectedType?: DocumentType
) {

  /*
   * -----------------------------------------
   * OCR
   * -----------------------------------------
   */

  const result = await Tesseract.recognize(
    imagePath,
    "eng"
  );

  const text = result.data.text;

  const normalizedText =
    text.toLowerCase();

  /*
   * -----------------------------------------
   * DOCUMENT TYPE DETECTION
   * -----------------------------------------
   */

  let detectedType:
    | DocumentType
    | "UNKNOWN" = "UNKNOWN";

  let confidence = 0;

  /*
   * -----------------------------------------
   * AADHAAR
   * -----------------------------------------
   */

  const aadhaarNumber =
    text.match(
      /\b\d{4}\s?\d{4}\s?\d{4}\b/
    );

  const aadhaarKeywords = [
    "aadhaar",
    "aadhar",
    "uidai",
    "unique identification",
    "government of india",
  ];

  const aadhaarKeywordMatches =
    aadhaarKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    aadhaarNumber ||
    aadhaarKeywordMatches >= 1
  ) {
    detectedType = "AADHAAR";

    confidence =
      aadhaarNumber ? 95 : 80;
  }

  /*
   * -----------------------------------------
   * PAN
   * -----------------------------------------
   */

  const panNumber =
    text.match(
      /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i
    );

  const panKeywords = [
    "income tax department",
    "permanent account number",
    "e-pan",
  ];

  const panKeywordMatches =
    panKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    detectedType === "UNKNOWN" &&
    (
      panNumber ||
      panKeywordMatches >= 1
    )
  ) {

    detectedType = "PAN";

    confidence =
      panNumber ? 95 : 80;
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
    "gross salary",
    "net salary",
    "basic salary",
    "earnings",
    "deductions",
    "payslip",
    "pay slip",
    "employee id",
    "employee code",
  ];

  const salaryMatches =
    salaryKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    detectedType === "UNKNOWN" &&
    salaryMatches >= 2
  ) {

    detectedType =
      "SALARY_SLIP";

    confidence = Math.min(
      60 + salaryMatches * 8,
      95
    );
  }

  /*
   * -----------------------------------------
   * BANK PASSBOOK
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
    bankKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    detectedType === "UNKNOWN" &&
    bankMatches >= 3
  ) {

    detectedType =
      "BANK_PASSBOOK";

    confidence = Math.min(
      60 + bankMatches * 7,
      95
    );
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
    propertyKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    detectedType === "UNKNOWN" &&
    propertyMatches >= 3
  ) {

    detectedType =
      "PROPERTY_DOCUMENT";

    confidence = Math.min(
      55 + propertyMatches * 7,
      95
    );
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
    "gold jewelry",
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
    goldKeywords.filter(
      (keyword) =>
        normalizedText.includes(keyword)
    ).length;

  if (
    detectedType === "UNKNOWN" &&
    goldMatches >= 3
  ) {

    detectedType =
      "GOLD_DOCUMENT";

    confidence = Math.min(
      55 + goldMatches * 7,
      95
    );
  }

  /*
   * -----------------------------------------
   * DOCUMENT VALIDATION
   * -----------------------------------------
   */

  let documentValid = true;

  let validationMessage =
    "Document type verified";

  if (expectedType) {

    if (detectedType === "UNKNOWN") {

      documentValid = false;

      validationMessage =
        "Unable to identify the uploaded document.";

    } else if (
      detectedType !== expectedType
    ) {

      documentValid = false;

      validationMessage =
        `Invalid document. Expected ${expectedType}, but detected ${detectedType}.`;
    }
  }

  /*
   * -----------------------------------------
   * AADHAAR NUMBER
   * -----------------------------------------
   */

  const aadhaar =
    aadhaarNumber?.[0] ||
    "Not Found";

  /*
   * -----------------------------------------
   * PAN NUMBER
   * -----------------------------------------
   */

  const pan =
    panNumber?.[0] ||
    "Not Found";

  /*
   * -----------------------------------------
   * MOBILE
   * -----------------------------------------
   */

  const mobile =
    text.match(
      /[6-9]\d{9}/
    )?.[0] ||
    "Not Found";

  /*
   * -----------------------------------------
   * DOB
   * -----------------------------------------
   */

  const dobMatch =
    text.match(
      /\b(?:DOB|D\.O\.B|Date of Birth|Birth)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    );

  let dob =
    dobMatch?.[1] ||
    "Not Found";

  if (dob !== "Not Found") {
    dob =
      dob.replace(
        /[-.]/g,
        "/"
      );
  }

  /*
   * -----------------------------------------
   * NAME EXTRACTION
   * -----------------------------------------
   */

  const lines =
    text
      .split("\n")
      .map(
        (x) => x.trim()
      )
      .filter(
        (x) => x.length > 2
      );

  const ignoreWords = [
    "government",
    "india",
    "aadhaar",
    "aadhar",
    "authority",
    "information",
    "address",
    "dob",
    "mobile",
    "vid",
    "enrolment",
    "proof",
    "unique",
    "income",
    "tax",
    "department",
    "permanent",
    "account",
    "number",
    "bank",
    "statement",
    "salary",
    "gross",
    "net",
    "earnings",
    "deductions",
    "date",
    "birth",
    "property",
    "sale deed",
    "registration",
    "registrar",
    "gold",
    "jewellery",
    "jewelry",
    "valuation",
  ];

  const name =
    lines.find(
      (line) => {

        const l =
          line.toLowerCase();

        if (
          ignoreWords.some(
            (word) =>
              l.includes(word)
          )
        ) {
          return false;
        }

        return (
          /^[A-Za-z ]+$/.test(line) &&
          line.length > 8 &&
          line.split(" ").length >= 2
        );
      }
    ) || "Unknown";

  /*
   * -----------------------------------------
   * RETURN RESULT
   * -----------------------------------------
   */

  return {

    rawText: text,

    name,

    dob,

    aadhaar,

    pan,

    mobile,

    detectedType,

    expectedType:
      expectedType ||
      "NOT_SPECIFIED",

    confidence,

    documentValid,

    validationMessage,
  };
}