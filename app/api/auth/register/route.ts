import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role, adminSecret } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 });
    }

    // Role-based verification
    let userRole = "CUSTOMER";
    if (role === "ADMIN") {
      if (adminSecret !== "ZAMBIA-ADMIN-2026") {
        return NextResponse.json({ error: "Invalid Admin Authorization Secret." }, { status: 401 });
      }
      userRole = "ADMIN";
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await db.user.create({
      data: {
        id: userId,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: userRole,
        approved: true, // Auto-approve all users to prevent friction and login blockages
      },
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
