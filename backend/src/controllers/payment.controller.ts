import dotenv from "dotenv";
dotenv.config();


import { Request, Response } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import prisma from "../lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/*
=========================================================
CREATE RAZORPAY ORDER
=========================================================
*/

export const createPaymentOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const { loanId } = req.body;

    if (!loanId) {
      return res.status(400).json({
        success: false,
        message: "Loan ID is required.",
      });
    }

    /*
    -----------------------------------------------------
    FIND LOAN
    -----------------------------------------------------
    */

    const loan =
      await prisma.loanApplication.findUnique({
        where: {
          id: String(loanId),
        },
      });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    /*
    -----------------------------------------------------
    ONLY APPROVED LOANS CAN PAY
    -----------------------------------------------------
    */

    if (loan.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        message:
          "Payment is available only after loan approval.",
      });
    }

    /*
    -----------------------------------------------------
    PREVENT DUPLICATE PAYMENT
    -----------------------------------------------------
    */

    if ((loan as typeof loan & { paymentStatus?: string }).paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been completed.",
      });
    }

    /*
    -----------------------------------------------------
    PROCESSING FEE
    -----------------------------------------------------

    Demo fee:
    ₹999 for all loan types

    Later we can make this dynamic according
    to Personal / Property / Gold.
    */

    const paymentAmount = 999;

    /*
    -----------------------------------------------------
    CREATE RAZORPAY ORDER

    Razorpay amount is in paise.
    ₹999 = 99900 paise
    -----------------------------------------------------
    */

    const order =
      await razorpay.orders.create({
        amount: paymentAmount * 100,
        currency: "INR",
        receipt: `trustfi_${loan.id}`,
        notes: {
          loanId: loan.id,
          loanType: loan.loanType,
          applicantEmail: loan.email,
        },
      });

    /*
    -----------------------------------------------------
    SAVE ORDER DETAILS
    -----------------------------------------------------
    */

    await prisma.loanApplication.update({
      where: {
        id: loan.id,
      },
      data: {
        paymentStatus: "PENDING",
        paymentAmount,
        razorpayOrderId: order.id,
      },
    });

    /*
    -----------------------------------------------------
    RESPONSE
    -----------------------------------------------------
    */

    return res.json({
      success: true,

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      paymentAmount,

      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error(
      "Create Payment Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create payment order.",
    });
  }
};

/*
=========================================================
VERIFY RAZORPAY PAYMENT
=========================================================
*/

export const verifyPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      loanId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    /*
    -----------------------------------------------------
    BASIC VALIDATION
    -----------------------------------------------------
    */

    if (
      !loanId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing payment verification details.",
      });
    }

    /*
    -----------------------------------------------------
    FIND LOAN
    -----------------------------------------------------
    */

    const loan =
      await prisma.loanApplication.findUnique({
        where: {
          id: String(loanId),
        },
      });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    /*
    -----------------------------------------------------
    CHECK ORDER ID
    -----------------------------------------------------
    */

    if (
      (loan as typeof loan & { razorpayOrderId?: string | null })
        .razorpayOrderId !== razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay order.",
      });
    }

    /*
    -----------------------------------------------------
    GENERATE SIGNATURE
    -----------------------------------------------------
    */

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET!
        )
        .update(body)
        .digest("hex");

    /*
    -----------------------------------------------------
    COMPARE SIGNATURES
    -----------------------------------------------------
    */

    const isValid =
      expectedSignature ===
      razorpay_signature;

    if (!isValid) {
      await prisma.loanApplication.update({
        where: {
          id: loan.id,
        },
        data: {
          paymentStatus: "FAILED",
        },
      });

      return res.status(400).json({
        success: false,
        message:
          "Payment signature verification failed.",
      });
    }

    /*
    -----------------------------------------------------
    PAYMENT VERIFIED
    -----------------------------------------------------
    */

    const updatedLoan =
      await prisma.loanApplication.update({
        where: {
          id: loan.id,
        },
        data: {
          paymentStatus: "PAID",
          razorpayPaymentId:
            razorpay_payment_id,
          paidAt: new Date(),

          // Loan becomes active after
          // successful payment verification.
          status: "ACTIVE",
        },
      });

    /*
    -----------------------------------------------------
    SUCCESS RESPONSE
    -----------------------------------------------------
    */

    return res.json({
      success: true,
      message:
        "Payment verified successfully. Loan activated.",
      loan: updatedLoan,
    });

  } catch (error: any) {
    console.error(
      "Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed.",
    });
  }
};