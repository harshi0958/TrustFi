import { Router } from "express";
import multer from "multer";
import { ocrController } from "../controllers/ocr.controller";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

router.post(
  "/upload",
  upload.single("document"),
  ocrController
);

export default router;