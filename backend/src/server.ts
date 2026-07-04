import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ocrRoutes from "./routes/ocr.routes";
import loanRoutes from "./routes/loan.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/loan", loanRoutes);
app.use("/api/ocr", ocrRoutes);
app.get("/", (_, res) => {
  res.send("TrustFi Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});