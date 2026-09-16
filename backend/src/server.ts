import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import ocrRoutes from "./routes/ocr.routes";
import loanRoutes from "./routes/loan.routes";
import adminRoutes from "./routes/admin.routes";
import paymentRoutes from "./routes/payment.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/loan", loanRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/payment",
  paymentRoutes
);

app.get("/", (_, res) => {
  res.send("TrustFi Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});