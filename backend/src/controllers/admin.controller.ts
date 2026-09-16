import { Request, Response } from "express";
import crypto from "crypto";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";

/*
 * Temporary OTP storage.
 *
 * OTP is valid for only 20 seconds.
 * We will improve this later with database/Redis
 * if needed for production.
 */

interface OTPRecord {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OTPRecord>();

/*
 * Gmail SMTP configuration
 */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

/*
 * -----------------------------------------
 * ADMIN REGISTRATION
 * -----------------------------------------
 */

export const registerAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required.",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const existingAdmin =
      await (prisma as any).admin.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message:
          "Admin account with this email already exists.",
      });
    }

    const admin =
      await (prisma as any).admin.create({
        data: {
          name: String(name).trim(),
          email: normalizedEmail,
        },
      });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error(
      "Admin Registration Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Admin registration failed.",
    });
  }
};

/*
 * -----------------------------------------
 * REQUEST OTP
 * -----------------------------------------
 */

export const requestAdminOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    /*
     * Only registered admins can request OTP.
     */

    const admin =
      await (prisma as any).admin.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "No admin account found with this email.",
      });
    }

    /*
     * Generate secure 4-digit OTP.
     */

    const otp = crypto
      .randomInt(1000, 10000)
      .toString();

    /*
     * OTP expires after 20 seconds.
     */

    const expiresAt =
      Date.now() + 20 * 1000;

    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
    });

    /*
     * Send OTP to registered email.
     */

    await transporter.sendMail({
      from: `"TrustFi Admin" <${process.env.ADMIN_EMAIL}>`,
      to: normalizedEmail,
      subject: "TrustFi Admin Login OTP",

      text: `
Your TrustFi Admin login OTP is ${otp}.

This OTP is valid for 20 seconds.

If you did not request this code, please ignore this email.
      `,

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 500px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 12px;
        ">

          <h2 style="color:#06b6d4;">
            TrustFi Admin Login
          </h2>

          <p>
            Hello ${admin.name},
          </p>

          <p>
            Your one-time password for TrustFi
            Admin Dashboard is:
          </p>

          <div style="
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 12px;
            text-align: center;
            padding: 20px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP will expire in
            <strong>20 seconds</strong>.
          </p>

          <p style="color:#777;">
            If you did not request this code,
            please ignore this email.
          </p>

          <hr />

          <p style="
            font-size:12px;
            color:#999;
          ">
            TrustFi — Confidential Lending Platform
          </p>

        </div>
      `,
    });

    console.log(
      `Admin OTP sent to ${normalizedEmail}`
    );

    return res.json({
      success: true,
      message: "OTP sent successfully.",
      expiresIn: 20,
    });
  } catch (error: any) {
    console.error(
      "Admin OTP Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send OTP.",
    });
  }
};

/*
 * -----------------------------------------
 * VERIFY OTP
 * -----------------------------------------
 */

export const verifyAdminOTP = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message:
          "Email and OTP are required.",
      });
    }

    const normalizedEmail = String(email)
      .trim()
      .toLowerCase();

    const record =
      otpStore.get(normalizedEmail);

    /*
     * No OTP found.
     */

    if (!record) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }

    /*
     * Check expiry.
     */

    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalizedEmail);

      return res.status(400).json({
        success: false,
        message:
          "OTP expired. Please request a new OTP.",
      });
    }

    /*
     * Check OTP.
     */

    if (
      String(otp).trim() !== record.otp
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid OTP. Please try again.",
      });
    }

    /*
     * OTP verified successfully.
     */

    otpStore.delete(normalizedEmail);

    const admin =
      await (prisma as any).admin.findUnique({
        where: {
          email: normalizedEmail,
        },
      });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message:
          "Admin account not found.",
      });
    }

    /*
     * Temporary session token.
     *
     * We will protect the admin dashboard
     * with this in the next step.
     */

    const token = crypto
      .randomBytes(32)
      .toString("hex");

    return res.json({
      success: true,
      message:
        "Admin login successful.",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error: any) {
    console.error(
      "Admin OTP Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "OTP verification failed.",
    });
  }
};

// =========================
// ADMIN DASHBOARD OVERVIEW
// =========================
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // -------------------------
    // BASIC STATISTICS
    // -------------------------

    const totalLoans = loans.length;

    const totalUsers = new Set(
      loans.map((loan) => loan.email.toLowerCase())
    ).size;

    const totalLoanAmount = loans.reduce(
      (total, loan) => total + loan.loanAmount,
      0
    );

    const approvedLoans = loans.filter(
      (loan) => loan.status === "APPROVED"
    ).length;

    const pendingLoans = loans.filter(
      (loan) => loan.status === "PENDING"
    ).length;

    const rejectedLoans = loans.filter(
      (loan) => loan.status === "REJECTED"
    ).length;

    // -------------------------
    // LOAN TYPE STATISTICS
    // -------------------------

    const personalLoans = loans.filter(
      (loan) => loan.loanType === "PERSONAL"
    );

    const propertyLoans = loans.filter(
      (loan) => loan.loanType === "PROPERTY"
    );

    const goldLoans = loans.filter(
      (loan) => loan.loanType === "GOLD"
    );

    // -------------------------
    // LOAN TYPE AMOUNTS
    // -------------------------

    const personalAmount = personalLoans.reduce(
      (total, loan) => total + loan.loanAmount,
      0
    );

    const propertyAmount = propertyLoans.reduce(
      (total, loan) => total + loan.loanAmount,
      0
    );

    const goldAmount = goldLoans.reduce(
      (total, loan) => total + loan.loanAmount,
      0
    );

    // -------------------------
    // RECENT APPLICATIONS
    // -------------------------

    const recentApplications = loans.slice(0, 10);

    // -------------------------
    // RESPONSE
    // -------------------------

    res.json({
      success: true,

      statistics: {
        totalUsers,
        totalLoans,
        totalLoanAmount,
        approvedLoans,
        pendingLoans,
        rejectedLoans,
      },

      loanTypes: {
        personal: {
          count: personalLoans.length,
          amount: personalAmount,
        },

        property: {
          count: propertyLoans.length,
          amount: propertyAmount,
        },

        gold: {
          count: goldLoans.length,
          amount: goldAmount,
        },
      },

      recentApplications,
    });
  } catch (error: any) {
    console.error("Admin Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load admin dashboard.",
      error: error.message,
    });
  }
};

// =========================
// ADMIN USERS
// =========================
export const getAdminUsers = async (req: Request, res: Response) => {
  try {
    const loans = await prisma.loanApplication.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group applications by email
    const usersMap = new Map<string, any>();

    for (const loan of loans) {
      const email = loan.email.toLowerCase();

      if (!usersMap.has(email)) {
        usersMap.set(email, {
          email,
          fullName: loan.fullName,
          phone: loan.phone,

          totalApplications: 0,
          totalRequestedAmount: 0,

          approvedLoans: 0,
          pendingLoans: 0,
          rejectedLoans: 0,

          applications: [],
        });
      }

      const user = usersMap.get(email);

      user.totalApplications += 1;
      user.totalRequestedAmount += loan.loanAmount;

      if (loan.status === "APPROVED") {
        user.approvedLoans += 1;
      }

      if (loan.status === "PENDING") {
        user.pendingLoans += 1;
      }

      if (loan.status === "REJECTED") {
        user.rejectedLoans += 1;
      }

      user.applications.push(loan);
    }

    const users = Array.from(usersMap.values());

    res.json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error: any) {
    console.error("Admin Users Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load users.",
      error: error.message,
    });
  }
};