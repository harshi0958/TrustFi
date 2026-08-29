import { Request, Response } from "express";

import { extractText } from "../ocr/ocr.service";

export const ocrController = async (
  req: Request,
  res: Response
) => {
  try {

    /*
     * -----------------------------------------
     * CHECK FILE
     * -----------------------------------------
     */

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    /*
     * -----------------------------------------
     * EXPECTED DOCUMENT TYPE
     * -----------------------------------------
     */

    const expectedType = String(
      req.body.expectedType || ""
    ).toUpperCase();

    /*
     * -----------------------------------------
     * ALLOWED DOCUMENT TYPES
     * -----------------------------------------
     */

    const allowedTypes = [
      "AADHAAR",
      "PAN",
      "SALARY_SLIP",
      "BANK_PASSBOOK",
      "PROPERTY_DOCUMENT",
      "GOLD_DOCUMENT",
      "SELFIE",
    ];

    /*
     * -----------------------------------------
     * VALIDATE TYPE
     * -----------------------------------------
     */

    if (!allowedTypes.includes(expectedType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing document type",
        allowedTypes,
      });
    }

    /*
     * -----------------------------------------
     * SELFIE
     *
     * Do NOT send selfie through OCR.
     * A selfie is an image used for
     * face verification.
     * -----------------------------------------
     */

    if (expectedType === "SELFIE") {
      return res.json({
        success: true,
        message: "Selfie uploaded successfully",
        expectedDocumentType: "SELFIE",

        extractedText: {
          rawText: "",
          name: "Not Applicable",
          aadhaar: "Not Applicable",
          mobile: "Not Applicable",
          dob: "Not Applicable",

          detectedType: "SELFIE",
          expectedType: "SELFIE",

          confidence: 100,

          documentValid: true,

          validationMessage:
            "Selfie accepted for identity verification.",
        },
      });
    }

    /*
     * -----------------------------------------
     * OCR
     * -----------------------------------------
     */

    const result = await extractText(
      req.file.path,
      expectedType as any
    );

    /*
     * -----------------------------------------
     * RESPONSE
     * -----------------------------------------
     */

    return res.json({
      success: true,

      message:
        "Document uploaded and verified successfully",

      expectedDocumentType: expectedType,

      extractedText: result,
    });

  } catch (err: any) {

    console.error("OCR Error:", err);

    return res.status(500).json({
      success: false,
      message:
        err.message ||
        "OCR processing failed",
    });
  }
};