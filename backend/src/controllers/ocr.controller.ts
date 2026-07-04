import { Request, Response } from "express";
import { extractText } from "../ocr/ocr.service";

export const ocrController = async (
  req: Request,
  res: Response
) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const result = await extractText(req.file.path);

    res.json({
      success: true,
      extractedText: result,
    });

  } catch (err: any) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};