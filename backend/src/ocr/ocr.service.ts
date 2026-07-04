import Tesseract from "tesseract.js";

export async function extractText(imagePath: string) {

    const result = await Tesseract.recognize(
        imagePath,
        "eng"
    );

    const text = result.data.text;

    const aadhaar =
        text.match(/\d{4}\s?\d{4}\s?\d{4}/)?.[0] ||
        "Not Found";

    const mobile =
        text.match(/[6-9]\d{9}/)?.[0] ||
        "Not Found";

    const lines = text
        .split("\n")
        .map(x => x.trim())
        .filter(x => x.length > 2);

    const ignoreWords = [
  "government",
  "india",
  "aadhaar",
  "authority",
  "information",
  "address",
  "dob",
  "mobile",
  "vid",
  "enrolment",
  "proof",
  "unique",
];

const name =
  lines.find((line) => {

    const l = line.toLowerCase();

    if (ignoreWords.some(word => l.includes(word))) {
      return false;
    }

    return /^[A-Za-z ]+$/.test(line)
      && line.length > 8
      && line.split(" ").length >= 2;

  }) || "Unknown";

    return {
        rawText: text,
        name,
        aadhaar,
        mobile
    };
}