import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const subscriberId = `sub_${Date.now().toString()}_${Math.floor(Math.random() * 1000)}`;

    // Create subscriber or return success if they exist (use upsert or try-catch unique)
    try {
      await db.newsletterSubscriber.create({
        data: {
          id: subscriberId,
          email: email.trim().toLowerCase(),
        },
      });
    } catch (e: any) {
      // If code is P2002, it means unique constraint violation. We return success gracefully.
      if (e.code !== "P2002") {
        throw e;
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
