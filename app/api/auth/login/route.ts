import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shopease_zambia_secret_key_2026";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Auto-approve administrator users and standard seed users
    const autoApproveEmails = ["buyer@gmail.com", "bornfacek135@gmail.com", "bornface@gmail.com"];
    let isApproved = user.approved;
    if (user.role === "ADMIN" || autoApproveEmails.includes(user.email)) {
      if (!user.approved) {
        await db.user.update({
          where: { id: user.id },
          data: { approved: true },
        });
        isApproved = true;
      }
    }

    if (!isApproved) {
      return NextResponse.json({
        error: "Your account is pending administrator approval. Please contact support@shopeease.com."
      }, { status: 401 });
    }

    // Sign JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
