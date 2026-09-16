import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { sendWelcomeEmail } from "../services/email.service";
import twilio from "twilio";

// =====================================================
// REGISTER USER
// =====================================================

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and mobile number are required.",
      });
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).replace(/\s+/g, "");

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name.",
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Indian mobile number validation
    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number.",
      });
    }

    // -----------------------------
    // CHECK EXISTING USER
    // -----------------------------

    const userModel = (prisma as any).user;

    const existingUser = await userModel.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { phone: cleanPhone },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      if (existingUser.phone === cleanPhone) {
        return res.status(409).json({
          success: false,
          message: "An account with this mobile number already exists.",
        });
      }
    }

    // -----------------------------
    // CREATE USER
    // -----------------------------

    const user = await userModel.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    // -----------------------------
    // SEND WELCOME EMAIL
    // -----------------------------

    const emailSent = await sendWelcomeEmail(
      user.name,
      user.email
    );

    if (!emailSent) {
      console.error(
        `User ${user.id} was created, but welcome email could not be sent.`
      );
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful.",
      user,
    });
  } catch (error: any) {
    console.error("User Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Registration failed.",
    });
  }
};

// =====================================================
// SEND OTP USING TWILIO VERIFY
// =====================================================

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required.",
      });
    }

    const cleanPhone = String(phone).replace(/\s+/g, "");

    const normalizedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const phoneRegex = /^\+91[6-9]\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number.",
      });
    }

    // -----------------------------
    // CHECK REGISTERED USER
    // -----------------------------

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No TrustFi account found with this mobile number. Please register first.",
      });
    }

    // -----------------------------
    // CHECK TWILIO ENVIRONMENT
    // -----------------------------

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error("Twilio environment variables are missing.");

      return res.status(500).json({
        success: false,
        message: "Twilio configuration is missing on the server.",
      });
    }

    // -----------------------------
    // CREATE TWILIO CLIENT
    // -----------------------------

    const twilioClient = twilio(
      accountSid,
      authToken
    );

    // -----------------------------
    // SEND SMS OTP
    // -----------------------------

    const verification =
      await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verifications.create({
          to: normalizedPhone,
          channel: "sms",
        });

    console.log("=================================");
    console.log("TrustFi Twilio OTP Request");
    console.log("User:", user.name);
    console.log("Mobile:", normalizedPhone);
    console.log("Twilio Status:", verification.status);
    console.log("Channel:", verification.channel);
    console.log("=================================");

    return res.json({
      success: true,
      message: "OTP sent successfully to your mobile number.",
      status: verification.status,
    });
  } catch (error: any) {
    console.error("Twilio Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to send OTP. Please try again.",
    });
  }
};

// =====================================================
// VERIFY OTP USING TWILIO VERIFY
// =====================================================

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile number and OTP are required.",
      });
    }

    const cleanPhone = String(phone).replace(/\s+/g, "");

    const normalizedPhone = cleanPhone.startsWith("+91")
      ? cleanPhone
      : `+91${cleanPhone}`;

    const cleanOTP = String(otp).trim();

    const phoneRegex = /^\+91[6-9]\d{9}$/;
    const otpRegex = /^\d{6}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number.",
      });
    }

    if (!otpRegex.test(cleanOTP)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit OTP.",
      });
    }

    // -----------------------------
    // CHECK REGISTERED USER
    // -----------------------------

    const user = await prisma.user.findUnique({
      where: {
        phone: normalizedPhone,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "No TrustFi account found with this mobile number.",
      });
    }

    // -----------------------------
    // CHECK TWILIO ENVIRONMENT
    // -----------------------------

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      console.error("Twilio environment variables are missing.");

      return res.status(500).json({
        success: false,
        message: "Twilio configuration is missing on the server.",
      });
    }

    // -----------------------------
    // CREATE TWILIO CLIENT
    // -----------------------------

    const twilioClient = twilio(
      accountSid,
      authToken
    );

    // -----------------------------
    // VERIFY OTP
    // -----------------------------

    const verificationCheck =
      await twilioClient.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({
          to: normalizedPhone,
          code: cleanOTP,
        });

    console.log("=================================");
    console.log("TrustFi OTP Verification");
    console.log("User:", user.name);
    console.log("Mobile:", normalizedPhone);
    console.log("Twilio Status:", verificationCheck.status);
    console.log("=================================");

    // -----------------------------
    // OTP SUCCESS
    // -----------------------------

    if (verificationCheck.status === "approved") {
      return res.json({
        success: true,
        message: "OTP verified successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });
    }

    // -----------------------------
    // OTP NOT APPROVED
    // -----------------------------

    return res.status(401).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  } catch (error: any) {
    console.error("Twilio Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "OTP verification failed. Please try again.",
    });
  }
};