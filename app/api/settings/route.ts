export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
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
    console.error("Public settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch store settings" }, { status: 500 });
  }
}
