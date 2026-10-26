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

    if (expectedType === "PROPERTY_DOCUMENT") {
      return res.json({
        success: true,
        message:
          "Property document file received. Ownership and authenticity have not been verified.",
        expectedDocumentType: expectedType,
        uploadId: req.file.filename,
        ocrSkipped: true,
        extractedText: {
          rawText: "",
          detectedType: "NOT_CHECKED",
          expectedType,
          confidence: 0,
          documentValid: false,
          validationMessage:
            "OCR type and property ownership checks were not performed.",
        },
      });
    }

    /*
     * -----------------------------------------
     * SELFIE
     *
     * Do NOT send selfie through OCR.
     * -----------------------------------------
     */

    if (expectedType === "SELFIE") {
      return res.json({
        success: true,

        message:
          "Selfie uploaded successfully",

        expectedDocumentType: "SELFIE",

        extractedText: {
          rawText: "",

          name: "Not Applicable",
          aadhaar: "Not Applicable",
          mobile: "Not Applicable",
          dob: "Not Applicable",

          detectedType: "SELFIE",
          expectedType: "SELFIE",

          confidence: 0,

          documentValid: false,

          validationMessage:
            "Selfie uploaded. Identity verification has not been performed.",

          /*
           * ---------------------------------
           * FRAUD RESULT
           * ---------------------------------
           */

          fraudRisk: 0,

          fraudRiskLevel: "LOW",

          fraudFlags: [],
        },
      });
    }

    /*
     * -----------------------------------------
     * OCR
     * -----------------------------------------
     */

    let result;

    try {
      result = await extractText(
        req.file.path,
        expectedType as any
      );
    } catch (error: unknown) {
      console.error("OCR processing failed for uploaded document:", error);

      return res.json({
        success: true,
        message:
          "File uploaded, but OCR processing could not be completed. Manual review is required.",
        expectedDocumentType: expectedType,
        extractedText: {
          rawText: "",
          detectedType: "UNKNOWN",
          expectedType,
          confidence: 0,
          documentValid: false,
          validationMessage:
            "OCR processing failed. The file was received, but document type and authenticity remain unverified.",
        },
      });
    }

    /*
     * -----------------------------------------
     * FRAUD / VALIDATION SUMMARY
     * -----------------------------------------
     */

    const fraudAssessment = {
      fraudScore: Number(
        result.fraudRisk || 0
      ),

      fraudRisk:
        result.fraudRiskLevel || "LOW",

      fraudFlags:
        Array.isArray(result.fraudFlags)
          ? result.fraudFlags
          : [],

      documentValid:
        Boolean(result.documentValid),

      confidence:
        Number(result.confidence || 0),
    };

    /*
     * -----------------------------------------
     * RESPONSE
     * -----------------------------------------
     */

    return res.json({
      success: true,

      message:
        result.documentValid
          ? "Document passed OCR document-type checks"
          : "Document was uploaded but OCR validation issues were detected",

      expectedDocumentType:
        expectedType,

      extractedText: result,

      /*
       * ---------------------------------------
       * FRAUD ASSESSMENT
       * ---------------------------------------
       */

      fraudAssessment,
    });

  } catch (err: any) {

    console.error(
      "OCR Error:",
      err
    );

    return res.status(500).json({
      success: false,

      message:
        err.message ||
        "OCR processing failed",
    });
  }
};