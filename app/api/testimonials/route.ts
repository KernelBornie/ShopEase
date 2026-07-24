import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Submit a new testimonial
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, rating, content } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }

    if (rating === undefined || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please provide a valid rating between 1 and 5." }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim() === "") {
      return NextResponse.json({ error: "Please write some feedback content." }, { status: 400 });
    }

    const testimonialId = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const testimonial = await db.testimonial.create({
      data: {
        id: testimonialId,
        name: name.trim(),
        rating,
        content: content.trim(),
        approved: false, // Default is pending approval
      },
    });

    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully! It is pending administrator approval.",
      testimonial,
    });
  } catch (error) {
    console.error("Testimonial submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
