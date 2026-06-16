import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// ── In-memory OTP store (survives hot reloads via global) ───────────
const globalForOtp = globalThis as unknown as {
  otpStore: Map<string, { otp: string; expiresAt: number }>;
};
if (!globalForOtp.otpStore) {
  globalForOtp.otpStore = new Map();
}
export const otpStore = globalForOtp.otpStore;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store with 5-minute expiry
    otpStore.set(email.toLowerCase().trim(), {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send via Gmail SMTP
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPass) {
      // Dev fallback: log OTP to console if SMTP not configured
      console.log(`\n🔐 [DEV OTP] Email: ${email} → OTP: ${otp}\n`);
      return NextResponse.json({
        success: true,
        message: "OTP sent successfully.",
        dev: true, // signals frontend to show a dev hint
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: `"Career Growth Portal" <${gmailUser}>`,
      to: email,
      subject: `Your Login OTP: ${otp}`,
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
          <h1 style="color: #818cf8; font-size: 22px; margin-bottom: 4px;">Career Growth Portal</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-bottom: 24px;">Your one-time verification code</p>
          <div style="background: #1e293b; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #334155;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #22d3ee;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 16px; text-align: center;">
            This code expires in <strong>5 minutes</strong>. Do not share it with anyone.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
