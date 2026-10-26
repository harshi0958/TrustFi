import assert from "node:assert/strict";
import test from "node:test";

import {
  detectDocumentType,
  validateDocument,
} from "./documentValidation.service";

test("identifies salary slips from payroll and pay-component text", () => {
  const text = `
    Payroll Register
    Employee Name: Sample Applicant
    Pay Period: April 2026
    Basic Pay: 45000
    Gross Pay: 52000
    Net Pay: 48000
    Deductions: 4000
  `;

  const detected = detectDocumentType(text);
  const validation = validateDocument("SALARY_SLIP", text);

  assert.equal(detected.type, "SALARY_SLIP");
  assert.ok(detected.confidence >= 70);
  assert.equal(validation.valid, true);
});

test("identifies passbook text using account identifiers missed by OCR", () => {
  const text = `
    BANK OF INDIA
    Savings Account Passbook
    Account Holder: Sample Applicant
    A/C No: 123456789012
    IFSC Code: BKID0001234
    Customer ID: 987654
  `;

  const detected = detectDocumentType(text);
  const validation = validateDocument("BANK_PASSBOOK", text);

  assert.equal(detected.type, "BANK_PASSBOOK");
  assert.ok(detected.confidence >= 70);
  assert.equal(validation.valid, true);
});

test("identifies bank statements with account and transaction signals", () => {
  const text = `
    Bank Name: Example Bank
    Account No: 123456789012
    IFSC: EXAM0001234
    Transaction Date Narration Withdrawal Deposit Balance
  `;

  assert.equal(
    validateDocument("BANK_PASSBOOK", text).valid,
    true
  );
});

test("does not accept unrelated or unreadable text as a bank document", () => {
  const unrelated = validateDocument(
    "BANK_PASSBOOK",
    "Quarterly project notes: milestones, owners, and meeting agenda."
  );
  const unreadable = validateDocument("BANK_PASSBOOK", " \n\t ");

  assert.equal(unrelated.valid, false);
  assert.equal(unrelated.detectedType, "UNKNOWN");
  assert.match(unrelated.reasons[0], /clear, full-page image/i);

  assert.equal(unreadable.valid, false);
  assert.equal(unreadable.detectedType, "UNKNOWN");
  assert.match(unreadable.reasons[0], /could not read text/i);
});

test("does not treat a detected bank document as a salary slip", () => {
  const text = `
    Bank of India Savings Passbook
    Account No: 123456789012
    IFSC: BKID0001234
    Opening Balance Transaction Credit
  `;

  const validation = validateDocument("SALARY_SLIP", text);

  assert.equal(validation.valid, false);
  assert.equal(validation.detectedType, "BANK_PASSBOOK");
});

test("keeps Aadhaar and property document classifications intact", () => {
  assert.equal(
    detectDocumentType("Government of India Aadhaar 1234 5678 9012").type,
    "AADHAAR"
  );
  assert.equal(
    detectDocumentType(
      "Registered sale deed for property at survey number 42 with stamp duty"
    ).type,
    "PROPERTY_DOCUMENT"
  );
});
