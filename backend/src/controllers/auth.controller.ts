import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { sendWelcomeEmail } from "../services/email.service";
import twilio from "twilio";
import {
  createSessionToken,
  getSessionCookieName,
  getSessionCookieOptions,
  verifySessionToken,
} from "../lib/auth-session";
import {
  createMockOtp,
  getOtpProvider,
  isLoopbackAddress,
  OtpConfigurationError,
  verifyMockOtp,
} from "../services/otp.service";

function getSafeErrorCode(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    (typeof error.code === "string" ||
      typeof error.code === "number") &&
    /^[A-Za-z0-9_-]{1,32}$/.test(String(error.code))
  ) {
    return String(error.code);
  }

  return error instanceof Error &&
    /^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(error.name)
    ? error.name
    : "UnknownError";
}

function isLoopbackRequest(req: Request): boolean {
  return isLoopbackAddress(req.socket.remoteAddress);
}

function createAuthenticatedSession(
  user: { id: string; name: string; email: string; phone: string },
  res: Response
) {
  const token = createSessionToken(user.id);

  res.cookie(
    getSessionCookieName(),
    token,
    getSessionCookieOptions()
  );

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
    console.error("User registration failed.", getSafeErrorCode(error));

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// =====================================================
// SEND OTP USING TWILIO VERIFY
// =====================================================

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const provider = getOtpProvider();

    if (provider === "mock" && !isLoopbackRequest(req)) {
      return res.status(403).json({
        success: false,
        message: "Demo OTP mode is available only from this computer.",
      });
    }

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

    if (provider === "mock") {
      const result = createMockOtp(user.id);
      if (result.status === "rate_limited") {
        return res.status(429).json({
          success: false,
          message: "Please wait before requesting another demo code.",
        });
      }

      return res.json({
        success: true,
        message: "A local demo code was generated. No SMS was sent.",
        provider: "mock",
        demoOtp: result.code,
        expiresInSeconds: result.expiresInSeconds,
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

    return res.json({
      success: true,
      message: "OTP sent successfully to your mobile number.",
      status: verification.status,
      provider: "twilio",
    });
  } catch (error: any) {
    console.error(
      "OTP send failed.",
      getSafeErrorCode(error)
    );

    if (error instanceof OtpConfigurationError) {
      return res.status(503).json({
        success: false,
        message: "OTP provider configuration is not available.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
};

// =====================================================
// VERIFY OTP USING TWILIO VERIFY
// =====================================================

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const provider = getOtpProvider();

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

    if (provider === "mock") {
      const result = verifyMockOtp(user.id, cleanOTP);
      if (result === "approved") {
        return createAuthenticatedSession(user, res);
      }

      return res.status(401).json({
        success: false,
        message: "Invalid or expired OTP. Please request a new code.",
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

    // -----------------------------
    // OTP SUCCESS
    // -----------------------------

    if (verificationCheck.status === "approved") {
      return createAuthenticatedSession(user, res);
    }

    // -----------------------------
    // OTP NOT APPROVED
    // -----------------------------

    return res.status(401).json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  } catch (error: any) {
    console.error(
      "OTP verification failed.",
      getSafeErrorCode(error)
    );

    if (error instanceof OtpConfigurationError) {
      return res.status(503).json({
        success: false,
        message: "OTP provider configuration is not available.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
};


export const getCurrentUser = async (
  req: Request,
  res: Response
) => {
  try {
    const cookieHeader = req.headers.cookie ?? "";
    const cookieName = getSessionCookieName();

    const token = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue.",
      });
    }

    const session = verifySessionToken(token);

    if (!session) {
      res.clearCookie(
        cookieName,
        getSessionCookieOptions()
      );

      return res.status(401).json({
        success: false,
        message: "Your session is invalid or has expired.",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      res.clearCookie(
        cookieName,
        getSessionCookieOptions()
      );

      return res.status(401).json({
        success: false,
        message: "Account not found. Please log in again.",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to validate your session.",
    });
  }
};

export const logoutUser = async (
  _req: Request,
  res: Response
) => {
  res.clearCookie(
    getSessionCookieName(),
    getSessionCookieOptions()
  );

  return res.json({
    success: true,
    message: "Logged out successfully.",
  });
};
