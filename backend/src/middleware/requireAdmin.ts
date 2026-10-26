import type { RequestHandler } from "express";
import prisma from "../lib/prisma";
import { verifyAdminSessionToken } from "../lib/admin-session";

export const requireAdmin: RequestHandler = async (
  req,
  res,
  next
) => {
  const authorization = req.get("authorization") || "";
  const match = /^Bearer ([^\s]+)$/i.exec(authorization);
  const adminId = match
    ? verifyAdminSessionToken(match[1])
    : null;

  if (!adminId) {
    res.status(401).json({
      success: false,
      message: "A valid administrator session is required.",
    });
    return;
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "The administrator session is no longer valid.",
      });
      return;
    }

    next();
  } catch (error: unknown) {
    console.error("Administrator session validation failed:", error);
    res.status(503).json({
      success: false,
      message: "Administrator access could not be verified.",
    });
  }
};
