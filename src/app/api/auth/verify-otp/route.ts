import { NextResponse } from "next/server";

// Import the shared OTP store from send-otp
const globalForOtp = globalThis as unknown as {
  otpStore: Map<string, { otp: string; expiresAt: number }>;
};
if (!globalForOtp.otpStore) {
  globalForOtp.otpStore = new Map();
}
const otpStore = globalForOtp.otpStore;

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required." },
        { status: 400 }
      );
    }

    const key = email.toLowerCase().trim();
    const stored = otpStore.get(key);

    if (!stored) {
      return NextResponse.json(
        { error: "No OTP found for this email. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check OTP match
    if (stored.otp !== otp.toString().trim()) {
      return NextResponse.json(
        { error: "Invalid OTP. Please check and try again." },
        { status: 400 }
      );
    }

    // OTP is valid — clean up and return session token
    otpStore.delete(key);

    // Generate a simple session token (in production use JWT)
    const sessionToken = `nexus-otp-verified-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully.",
      token: sessionToken,
      email: key,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
