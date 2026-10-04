import { Request, Response } from "express";
import { prisma } from "../../lib/db";
import { compareHash, hashPassword } from "../../utils/hash";
import { decodeToken, generateToken } from "../../utils/tokenize";
import { getCookieOptions, refreshCookieName } from "../../utils/cookie";
import generateCode from "../../utils/generate-code";
import sendEmail from "../../services/sendgrid.service";

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: `User with email: ${email} not found`,
      });
      return;
    }

    const isPasswordMatch = await compareHash(password, existingUser.password);

    if (!isPasswordMatch) {
      res.status(400).json({
        success: false,
        error: "Credentials not matched.",
      });
      return;
    }

    const tokens = generateToken({
      userId: existingUser.id,
      role: existingUser.role,
    });

    if (!tokens) {
      res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
      });
      return;
    }

    res.cookie(refreshCookieName, tokens.refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    // Web sends via httpOnly cookie, mobile sends in request body
    const refreshToken =
      req.cookies?.[refreshCookieName] || req.body?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    const decoded = await decodeToken(refreshToken);

    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!existingUser) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const tokens = generateToken({
      userId: existingUser.id,
      role: existingUser.role,
    });

    if (!tokens) {
      res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
      });
      return;
    }

    // Set cookie for web clients
    res.cookie(refreshCookieName, tokens.refreshToken, getCookieOptions());

    // Return both tokens in body — web ignores refreshToken, mobile saves it
    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid or expired refresh token",
    });
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(refreshCookieName, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function requestPasswordChange(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email || email.length < 1) {
      res.status(400).json({
        success: false,
        error: "Email required to process this request.",
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      // Fix #2 & #4: use res+return (not throw) for a 400, and keep message generic to prevent user enumeration
      res.status(400).json({
        success: false,
        error: "If that email is registered, an OTP has been sent.",
      });
      return;
    }

    const existingOtp = await prisma.otp.findUnique({
      where: { userId: existingUser.id },
    });

    const now = new Date();

    if (!existingOtp || existingOtp.expiresAt < now) {
      const newOtp = await prisma.otp.upsert({
        where: { userId: existingUser.id },
        update: {
          code: generateCode(),
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
        create: {
          code: generateCode(),
          userId: existingUser.id,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      await sendEmail({
        to: email,
        subject: "One Time Passcode - Al Khair Foundation",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2c3e50;">Al Khair Foundation</h2>
            <p>Dear User,</p>
            <p>Your One Time Passcode (OTP) is:</p>
            <h1 style="text-align: center; color: #223F81;">${newOtp.code}</h1>
            <p>This code will expire in 15 minutes. Do not share it with anyone.</p>
            <p style="margin-top: 30px;">Regards,<br/>Al Khair Foundation Team</p>
          </div>
        `,
      });

      // Fix #1: return after sending 200 so the 400 below is not also sent
      res
        .status(200)
        .json({ success: true, data: { userId: existingUser.id } });
      return;
    }

    res.status(400).json({
      success: false,
      error:
        "Please wait at least 15 minutes until your OTP expires before requesting a new one.",
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : error;
    console.error(err);
    res.status(500).json({ success: false, error: err });
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { otp, newPassword, userId } = req.body;

    const existingOtp = await prisma.otp.findUnique({
      where: { userId: userId },
    });

    if (!existingOtp || existingOtp.expiresAt < new Date()) {
      // Fix #3: also reject if the OTP exists but has expired
      res.status(400).json({
        success: false,
        error:
          "OTP seems to have expired. Repeat the process or contact Administrator.",
      });
      return;
    }

    if (Number(otp) !== existingOtp.code) {
      res
        .status(400)
        .json({ success: false, error: "Incorrect one-time password." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { password: await hashPassword(newPassword, 10) },
    });

    const tokens = generateToken({
      userId: updatedUser.id,
      role: updatedUser.role,
    });

    await prisma.otp.delete({ where: { userId: updatedUser.id } });

    if (!tokens) {
      res.status(500).json({
        success: false,
        error: "Failed to generate authentication tokens",
      });
      return;
    }

    res.cookie(refreshCookieName, tokens.refreshToken, getCookieOptions());

    res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error); // Fix #5: use console.error for server errors

    res.status(500).json({ success: false, error: "Internal server error." });
  }
}
