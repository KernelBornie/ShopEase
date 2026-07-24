export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shopeease_zambia_secret_key_2026";

async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== "ADMIN") return null;
    return decoded;
  } catch {
    return null;
  }
}

// GET: Retrieve store settings for admin
export async function GET(req: NextRequest) {
  try {
    let settings = await db.siteSettings.findFirst();
    if (!settings) {
      settings = await db.siteSettings.create({
        data: {
          id: "shop_ease_settings",
          siteName: "ShopEase",
          primaryColor: "#15803d",
          heroTitle: "ShopEase",
          heroSubtitle: "Your trusted partner for quality products, fast delivery, and exceptional service.",
          footerText: "© 2025 ShopEase. All rights reserved.",
          aboutTitle: "About ShopEase",
          aboutSubtitle: "Your trusted partner for quality products, fast delivery, and exceptional service.",
          aboutMission: "To make online shopping effortless, enjoyable, and accessible to everyone. We curate only the best products, ensuring premium quality at fair prices, and deliver them to your doorstep with care and speed.",
          aboutStory: "ShopEase was founded in 2025 by a group of e-commerce enthusiasts who believed that shopping online should be simple, safe, and satisfying. What started as a small local store in Lusaka has grown into Zambia's most reliable retail platform.",
          contactPhone: "+260 973 632 403",
          contactEmail: "support@shopeease.com",
          contactLocation: "Lusaka, Zambia",
          whatsappNumber: "260973632403",
          teamMembers: JSON.stringify([
            { name: "Mututwa Mututwa", role: "Founder & CEO", initials: "MM", desc: "Visionary leader driving retail innovation in Zambia." },
            { name: "Kaishe Mututwa", role: "Operations Manager", initials: "KM", desc: "Logistics specialist ensuring speedy regional deliveries." },
            { name: "Mututwa Junior", role: "Customer Support Lead", initials: "MJ", desc: "Dedicated champion for customer-first service." }
          ]),
          updatedAt: new Date(),
        },
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Admin settings GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update store settings (Admin only)
export async function PUT(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const body = await req.json();
    const {
      siteName,
      heroTitle,
      heroSubtitle,
      footerText,
      primaryColor,
      aboutTitle,
      aboutSubtitle,
      aboutMission,
      aboutStory,
      contactPhone,
      contactEmail,
      contactLocation,
      whatsappNumber,
      teamMembers,
    } = body;

    const existingSettings = await db.siteSettings.findFirst();
    let updated;

    const updatePayload = {
      siteName: siteName ?? existingSettings?.siteName ?? "ShopEase",
      heroTitle: heroTitle ?? existingSettings?.heroTitle ?? "ShopEase",
      heroSubtitle: heroSubtitle ?? existingSettings?.heroSubtitle ?? "Your trusted partner for quality products, fast delivery, and exceptional service.",
      footerText: footerText ?? existingSettings?.footerText ?? "© 2025 ShopEase. All rights reserved.",
      primaryColor: primaryColor ?? existingSettings?.primaryColor ?? "#15803d",
      aboutTitle: aboutTitle ?? existingSettings?.aboutTitle ?? "About ShopEase",
      aboutSubtitle: aboutSubtitle ?? existingSettings?.aboutSubtitle ?? "Your trusted partner for quality products, fast delivery, and exceptional service.",
      aboutMission: aboutMission ?? existingSettings?.aboutMission ?? "To make online shopping effortless, enjoyable, and accessible to everyone.",
      aboutStory: aboutStory ?? existingSettings?.aboutStory ?? "ShopEase was founded in 2025 by a group of e-commerce enthusiasts.",
      contactPhone: contactPhone ?? existingSettings?.contactPhone ?? "+260 973 632 403",
      contactEmail: contactEmail ?? existingSettings?.contactEmail ?? "support@shopeease.com",
      contactLocation: contactLocation ?? existingSettings?.contactLocation ?? "Lusaka, Zambia",
      whatsappNumber: whatsappNumber ?? existingSettings?.whatsappNumber ?? "260973632403",
      teamMembers: typeof teamMembers === "string" ? teamMembers : JSON.stringify(teamMembers || []),
      updatedAt: new Date(),
    };

    if (existingSettings) {
      updated = await db.siteSettings.update({
        where: { id: existingSettings.id },
        data: updatePayload,
      });
    } else {
      updated = await db.siteSettings.create({
        data: {
          id: "shop_ease_settings",
          ...updatePayload,
        },
      });
    }

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Admin settings PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
