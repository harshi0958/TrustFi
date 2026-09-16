import Tesseract from "tesseract.js";

export type DocumentType =
  | "AADHAAR"
  | "PAN"
  | "SALARY_SLIP"
  | "BANK_PASSBOOK"
  | "PROPERTY_DOCUMENT"
  | "GOLD_DOCUMENT"
  | "SELFIE";

/*
 * -----------------------------------------
 * TEXT NORMALIZATION
 * -----------------------------------------
 */

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * -----------------------------------------
 * CHECK WHETHER TEXT LOOKS LIKE A NAME
 * -----------------------------------------
 */

function isLikelyName(line: string) {
  const cleaned = line
    .replace(/[^A-Za-z\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    return false;
  }

  const words = cleaned.split(" ");

  /*
   * A person's name normally contains
   * at least two words.
   */

  if (words.length < 2) {
    return false;
  }

  /*
   * Ignore very long lines because they are
   * usually sentences / document descriptions.
   */

  if (cleaned.length > 60) {
    return false;
  }

  /*
   * Every word should contain alphabetic
   * characters.
   */

  const validWords = words.every((word) =>
    /^[A-Za-z.]+$/.test(word)
  );

  if (!validWords) {
    return false;
  }

  /*
   * Ignore common document words.
   */

  const ignored = [
    "government",
    "india",
    "aadhaar",
    "aadhar",
    "authority",
    "income",
    "tax",
    "department",
    "permanent",
    "account",
    "number",
    "bank",
    "statement",
    "salary",
    "slip",
    "salary slip",
    "gross",
    "net",
    "earnings",
    "deductions",
    "employee",
    "employee id",
    "employee code",
    "designation",
    "department",
    "date",
    "birth",
    "date of birth",
    "month",
    "year",
    "pay",
    "period",
    "basic",
    "allowance",
    "professional",
    "tax",
    "property",
    "sale",
    "deed",
    "registration",
    "registrar",
    "gold",
    "jewellery",
    "jewelry",
    "valuation",
  ];

  const normalized = normalizeText(cleaned);

  if (
    ignored.some((word) =>
      normalized.includes(word)
    )
  ) {
    return false;
  }

  return true;
}

/*
 * -----------------------------------------
 * SALARY SLIP NAME EXTRACTION
 * -----------------------------------------
 */

function extractSalarySlipName(
  lines: string[]
): string {
  const nameLabels = [
    "employee name",
    "employee",
    "emp name",
    "emp. name",
    "staff name",
    "worker name",
    "name of employee",
    "employee's name",
    "employees name",
    "name",
  ];

  /*
   * -----------------------------------------
   * STEP 1
   * Search for labels such as:
   *
   * Employee Name: ASHISH...
   * Name: ASHISH...
   * Employee: ASHISH...
   * -----------------------------------------
   */

  for (let i = 0; i < lines.length; i++) {
    const originalLine = lines[i].trim();
    const normalizedLine =
      normalizeText(originalLine);

    for (const label of nameLabels) {
      if (
        normalizedLine === label ||
        normalizedLine.startsWith(
          `${label}:`
        ) ||
        normalizedLine.startsWith(
          `${label} -`
        ) ||
        normalizedLine.startsWith(
          `${label} `
        )
      ) {
        /*
         * Remove the label from the line.
         */

        const afterLabel =
          originalLine
            .replace(
              new RegExp(
                `^${label}\\s*[:\\-]?\\s*`,
                "i"
              ),
              ""
            )
            .trim();

        if (isLikelyName(afterLabel)) {
          return afterLabel;
        }

        /*
         * If name is on the next line,
         * check next few lines.
         */

        for (
          let j = i + 1;
          j <= Math.min(i + 3, lines.length - 1);
          j++
        ) {
          const nextLine =
            lines[j].trim();

          if (isLikelyName(nextLine)) {
            return nextLine;
          }
        }
      }
    }
  }

  /*
   * -----------------------------------------
   * STEP 2
   * Look for lines containing
   * "Employee Name" with OCR mistakes.
   *
   * Example:
   * Employe Name
   * Employe Name ASHISH...
   * -----------------------------------------
   */

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const normalized =
      normalizeText(line);

    if (
      normalized.includes("employee") &&
      normalized.includes("name")
    ) {
      const parts = line.split(/[:\-]/);

      if (parts.length > 1) {
        const possibleName =
          parts
            .slice(1)
            .join(" ")
            .trim();

        if (
          isLikelyName(possibleName)
        ) {
          return possibleName;
        }
      }

      for (
        let j = i + 1;
        j <= Math.min(i + 3, lines.length - 1);
        j++
      ) {
        if (
          isLikelyName(lines[j])
        ) {
          return lines[j].trim();
        }
      }
    }
  }

  /*
   * -----------------------------------------
   * STEP 3
   * Fallback:
   * Search for likely person names.
   *
   * Prefer lines containing 2-4 words.
   * -----------------------------------------
   */

  const candidates = lines.filter(
    (line) => isLikelyName(line)
  );

  const suitableCandidate =
    candidates.find((line) => {
      const words =
        line.trim().split(/\s+/);

      return (
        words.length >= 2 &&
        words.length <= 5
      );
    });

  return (
    suitableCandidate?.trim() ||
    "Unknown"
  );
}

/*
 * -----------------------------------------
 * GENERAL NAME EXTRACTION
 * -----------------------------------------
 */

function extractGeneralName(
  lines: string[],
  expectedType?: DocumentType
): string {
  /*
   * Salary slip has its own specialized
   * extraction logic.
   */

  if (
    expectedType === "SALARY_SLIP"
  ) {
    return extractSalarySlipName(lines);
  }

  /*
   * PAN:
   * Look for a likely person name.
   */

  const candidates = lines.filter(
    (line) => isLikelyName(line)
  );

  return (
    candidates[0]?.trim() ||
    "Unknown"
  );
}

export async function extractText(
  imagePath: string,
  expectedType?: DocumentType
) {
  /*
   * -----------------------------------------
   * OCR
   * -----------------------------------------
   */

  const result =
    await Tesseract.recognize(
      imagePath,
      "eng"
    );

  const text = result.data.text;

  const normalizedText =
    normalizeText(text);

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
    if (
      detectedType === "UNKNOWN"
    ) {
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

  if (
    dob !== "Not Found"
  ) {
    dob = dob.replace(
      /[-.]/g,
      "/"
    );
  }

  /*
   * -----------------------------------------
   * OCR LINES
   * -----------------------------------------
   */

  const lines =
    text
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(
        (line) =>
          line.length > 2
      );

  /*
   * -----------------------------------------
   * NAME EXTRACTION
   * -----------------------------------------
   */

  const name =
    extractGeneralName(
      lines,
      expectedType
    );

  /*
   * -----------------------------------------
   * DEBUG LOG
   * -----------------------------------------
   */

  console.log(
    "========== OCR RESULT =========="
  );

  console.log(
    "Expected Type:",
    expectedType
  );

  console.log(
    "Detected Type:",
    detectedType
  );

  console.log(
    "Confidence:",
    confidence
  );

  console.log(
    "Extracted Name:",
    name
  );

  console.log(
    "Extracted DOB:",
    dob
  );

  console.log(
    "Raw OCR Text:",
    text
  );

  console.log(
    "================================"
  );

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