import type { RequestHandler } from "express";
import prisma from "../lib/prisma";
import {
  getSessionCookieName,
  verifySessionToken,
} from "../lib/auth-session";

export interface AuthenticatedCustomer {
  id: string;
  email: string;
}

export const requireCustomer: RequestHandler = async (
  req,
  res,
  next
) => {
  const cookieName = getSessionCookieName();
  const token = (req.headers.cookie ?? "")
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    res.status(401).json({
      success: false,
      message: "Please log in to manage loan payments.",
    });
    return;
  }

  try {
    const customer = await prisma.user.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true },
    });

    if (!customer) {
      res.status(401).json({
        success: false,
        message: "Your customer session is no longer valid. Please log in again.",
      });
      return;
    }

    res.locals.customer = customer satisfies AuthenticatedCustomer;
    next();
  } catch (error: unknown) {
    const errorType =
      error instanceof Error ? error.name : "UnknownError";
    console.error("Customer payment session validation failed.", errorType);
    res.status(503).json({
      success: false,
      message: "Customer access could not be verified.",
    });
  }
};
