import type { Request, Response } from "express";
import Razorpay from "razorpay";
import prisma from "../lib/prisma";
import type { AuthenticatedCustomer } from "../middleware/requireCustomer";
import {
  decidePaymentOrder,
  decidePaymentVerification,
  getRazorpayConfiguration,
  getSafeRazorpayFailure,
  isCapturedPaymentForExpectedOrder,
  customerOwnsLoan,
  PAYMENT_AMOUNT_INR,
  PAYMENT_AMOUNT_PAISE,
  PaymentConfigurationError,
  verifyRazorpaySignature,
} from "../services/payment.service";

function getCustomer(res: Response): AuthenticatedCustomer | null {
  const customer: unknown = res.locals.customer;
  if (
    !customer ||
    typeof customer !== "object" ||
    !("id" in customer) ||
    typeof customer.id !== "string" ||
    !("email" in customer) ||
    typeof customer.email !== "string"
  ) {
    return null;
  }

  return { id: customer.id, email: customer.email };
}

function createRazorpayClient(): {
  client: Razorpay;
  keyId: string;
  keySecret: string;
} {
  const configuration = getRazorpayConfiguration();
  return {
    client: new Razorpay({
      key_id: configuration.keyId,
      key_secret: configuration.keySecret,
    }),
    ...configuration,
  };
}

function isLoanOwnedByCustomer(
  loan: { userId: string | null; email: string },
  customer: AuthenticatedCustomer
): boolean {
  return customerOwnsLoan(loan, customer);
}

function unauthorizedLoanResponse(res: Response) {
  return res.status(404).json({
    success: false,
    message: "Loan application not found for this customer.",
  });
}

function paymentConfigurationResponse(
  res: Response,
  error: unknown
) {
  if (error instanceof PaymentConfigurationError) {
    return res.status(503).json({
      success: false,
      message: error.message,
    });
  }

  return null;
}

function getErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string" &&
    /^[A-Z0-9_]{1,64}$/.test(error.code)
  ) {
    return error.code;
  }

  return error instanceof Error ? error.name : "UnknownError";
}

export const createPaymentOrder = async (
  req: Request,
  res: Response
) => {
  const customer = getCustomer(res);

  if (!customer) {
    return res.status(401).json({
      success: false,
      message: "Please log in to manage loan payments.",
    });
  }

  const loanId =
    typeof req.body?.loanId === "string" ? req.body.loanId.trim() : "";

  if (!loanId) {
    return res.status(400).json({
      success: false,
      message: "Loan ID is required.",
    });
  }

  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanId },
      select: {
        id: true,
        userId: true,
        email: true,
        loanType: true,
        status: true,
        paymentStatus: true,
        razorpayOrderId: true,
      },
    });

    if (!loan || !isLoanOwnedByCustomer(loan, customer)) {
      return unauthorizedLoanResponse(res);
    }

    const orderDecision = decidePaymentOrder(
      loan.status,
      loan.paymentStatus,
      Boolean(loan.razorpayOrderId)
    );

    if (orderDecision === "NOT_APPROVED") {
      return res.status(409).json({
        success: false,
        message: "Payment is available only after loan approval.",
      });
    }

    if (orderDecision === "ALREADY_PAID") {
      return res.status(409).json({
        success: false,
        message: "Payment has already been completed.",
      });
    }

    const { client, keyId } = createRazorpayClient();

    if (orderDecision === "REUSE" && loan.razorpayOrderId) {
      let existingOrder;
      try {
        existingOrder = await client.orders.fetch(loan.razorpayOrderId);
      } catch (error: unknown) {
        const failure = getSafeRazorpayFailure(error, "fetch");
        console.error(
          "Razorpay existing-order lookup failed.",
          failure.diagnostics
        );
        return res.status(failure.status).json({
          success: false,
          message: failure.message,
        });
      }

      if (
        (existingOrder.status === "created" ||
          existingOrder.status === "attempted") &&
        existingOrder.amount === PAYMENT_AMOUNT_PAISE &&
        existingOrder.currency === "INR"
      ) {
        return res.json({
          success: true,
          order: {
            id: existingOrder.id,
            amount: existingOrder.amount,
            currency: existingOrder.currency,
          },
          paymentAmount: PAYMENT_AMOUNT_INR,
          keyId,
        });
      }

      if (existingOrder.status === "paid") {
        return res.status(409).json({
          success: false,
          message:
            "Razorpay reports a completed payment that has not yet been verified. Please contact support before retrying.",
        });
      }
    }

    let order;
    try {
      order = await client.orders.create({
        amount: PAYMENT_AMOUNT_PAISE,
        currency: "INR",
        receipt: `trustfi_${loan.id}`,
        notes: {
          loanId: loan.id,
          loanType: loan.loanType,
        },
      });
    } catch (error: unknown) {
      const failure = getSafeRazorpayFailure(error, "create");
      console.error(
        "Razorpay order creation failed.",
        failure.diagnostics
      );
      return res.status(failure.status).json({
        success: false,
        message: failure.message,
      });
    }

    await prisma.loanApplication.update({
      where: { id: loan.id },
      data: {
        paymentStatus: "PENDING",
        paymentAmount: PAYMENT_AMOUNT_INR,
        razorpayOrderId: order.id,
      },
    });

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      paymentAmount: PAYMENT_AMOUNT_INR,
      keyId,
    });
  } catch (error: unknown) {
    const configurationResponse = paymentConfigurationResponse(res, error);
    if (configurationResponse) return configurationResponse;

    console.error(
      "Payment order could not be saved.",
      getErrorCode(error)
    );
    return res.status(503).json({
      success: false,
      message:
        "The payment order could not be saved. Check backend database availability and payment schema.",
    });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response
) => {
  const customer = getCustomer(res);

  if (!customer) {
    return res.status(401).json({
      success: false,
      message: "Please log in to verify a loan payment.",
    });
  }

  const {
    loanId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body ?? {};

  if (
    typeof loanId !== "string" ||
    !loanId.trim() ||
    typeof orderId !== "string" ||
    !orderId.trim() ||
    typeof paymentId !== "string" ||
    !paymentId.trim() ||
    typeof signature !== "string" ||
    !signature.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing payment verification details.",
    });
  }

  try {
    const loan = await prisma.loanApplication.findUnique({
      where: { id: loanId.trim() },
      select: {
        id: true,
        userId: true,
        email: true,
        status: true,
        paymentStatus: true,
        paymentAmount: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
      },
    });

    if (!loan || !isLoanOwnedByCustomer(loan, customer)) {
      return unauthorizedLoanResponse(res);
    }

    const verificationDecision = decidePaymentVerification(
      loan.status,
      loan.paymentStatus,
      loan.razorpayPaymentId,
      paymentId
    );

    if (verificationDecision === "ALREADY_ACTIVATED") {
      return res.json({
        success: true,
        message: "Payment was already verified. Loan is active.",
        loan: { id: loan.id, status: loan.status },
      });
    }

    if (verificationDecision === "ALREADY_PAID") {
      return res.status(409).json({
        success: false,
        message: "A different payment has already been verified for this loan.",
      });
    }

    if (verificationDecision === "NOT_AWAITING_PAYMENT") {
      return res.status(409).json({
        success: false,
        message: "This loan is not awaiting payment verification.",
      });
    }

    if (!loan.razorpayOrderId || loan.razorpayOrderId !== orderId) {
      return res.status(400).json({
        success: false,
        message: "The payment order does not match this loan.",
      });
    }

    const { client, keySecret } = createRazorpayClient();

    if (!verifyRazorpaySignature(orderId, paymentId, signature, keySecret)) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed.",
      });
    }

    let payment;
    try {
      payment = await client.payments.fetch(paymentId);
    } catch (error: unknown) {
      const failure = getSafeRazorpayFailure(error, "fetch");
      console.error(
        "Razorpay payment lookup failed.",
        failure.diagnostics
      );
      return res.status(failure.status).json({
        success: false,
        message: failure.message,
      });
    }

    if (
      payment.order_id !== orderId ||
      Number(payment.amount) !== PAYMENT_AMOUNT_PAISE ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "The confirmed payment does not match the expected order.",
      });
    }

    if (!isCapturedPaymentForExpectedOrder(payment, orderId)) {
      return res.status(409).json({
        success: false,
        message:
          "Payment is not captured yet. The loan remains approved and inactive.",
      });
    }

    const update = await prisma.loanApplication.updateMany({
      where: {
        id: loan.id,
        status: "APPROVED",
        paymentStatus: "PENDING",
        razorpayOrderId: orderId,
      },
      data: {
        paymentStatus: "PAID",
        paymentAmount: PAYMENT_AMOUNT_INR,
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
        status: "ACTIVE",
      },
    });

    if (update.count !== 1) {
      const latest = await prisma.loanApplication.findUnique({
        where: { id: loan.id },
        select: {
          status: true,
          paymentStatus: true,
          razorpayPaymentId: true,
        },
      });

      if (
        latest?.paymentStatus === "PAID" &&
        latest.razorpayPaymentId === paymentId
      ) {
        return res.json({
          success: true,
          message: "Payment was already verified. Loan is active.",
          loan: { id: loan.id, status: latest.status },
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "The loan payment state changed before activation. Contact support if the payment was captured.",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully. Loan activated.",
      loan: { id: loan.id, status: "ACTIVE" },
    });
  } catch (error: unknown) {
    const configurationResponse = paymentConfigurationResponse(res, error);
    if (configurationResponse) return configurationResponse;

    console.error(
      "Payment verification could not be completed.",
      getErrorCode(error)
    );
    return res.status(503).json({
      success: false,
      message:
        "Payment verification could not be completed. The loan remains inactive.",
    });
  }
};
