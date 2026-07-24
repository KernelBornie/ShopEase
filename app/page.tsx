import React from "react";
import { db } from "@/lib/db";
import ProductList from "@/components/ProductList";

export const revalidate = 0; // Disable caching to fetch real-time fresh data

export default async function Home() {
  let siteSettings = null;
  let products: any[] = [];
  let testimonials: any[] = [];

  try {
    // 1. Fetch & seed SiteSettings if not present
    const existingSettings = await db.siteSettings.findFirst();
    if (existingSettings) {
      siteSettings = existingSettings;
    } else {
      siteSettings = await db.siteSettings.create({
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
  } catch (error) {
    console.error("Failed to load SiteSettings:", error);
  }

  try {
    // 2. Fetch all products from database
    const rawProducts = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // Serialize date objects to plain string attributes
    products = rawProducts.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to load Products:", error);
  }

  let categories: any[] = [];
  try {
    const rawCategories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    if (rawCategories.length === 0) {
      const defaultCategories = [
        { id: "c_groceries", name: "Groceries", slug: "groceries" },
        { id: "c_electronics", name: "Electronics", slug: "electronics" },
        { id: "c_general", name: "general", slug: "general" },
        { id: "c_home_goods", name: "Home Goods", slug: "home-goods" },
      ];
      for (const cat of defaultCategories) {
        await db.category.create({ data: cat });
      }
      categories = defaultCategories.map(c => ({
        ...c,
        createdAt: new Date().toISOString(),
      }));
    } else {
      categories = rawCategories.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }));
    }
  } catch (error) {
    console.error("Failed to load or seed categories:", error);
  }

  try {
    // 3. Fetch approved or any testimonials from database
    let rawTestimonials = await db.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    // If empty, seed default high-quality Zambian reviews
    if (rawTestimonials.length === 0) {
      const defaultTestimonials = [
        {
          id: "t_seed_1",
          name: "Bornface Kangombe",
          rating: 5,
          content: "Excellent customer service and premium products. Highly recommended for retail and wholesale buyers in Zambia.",
          approved: true,
          createdAt: new Date(),
        },
        {
          id: "t_seed_2",
          name: "Mwansa Chilufya",
          rating: 5,
          content: "ShopEase has completely transformed our grocery shopping. Orders arrive in Lusaka in under two hours with Airtel Money!",
          approved: true,
          createdAt: new Date(),
        },
        {
          id: "t_seed_3",
          name: "Mututwa Mututwa",
          rating: 5,
          content: "Affordable pricing, lightning-fast logistics, and extremely friendly staff. Best store in Lusaka!",
          approved: true,
          createdAt: new Date(),
        },
      ];

      for (const t of defaultTestimonials) {
        await db.testimonial.create({ data: t });
      }

      rawTestimonials = await db.testimonial.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    // Serialize date objects to plain string attributes
    testimonials = rawTestimonials.map(t => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to load Testimonials:", error);
  }

  return (
    <main className="min-h-screen">
      <ProductList
        initialProducts={products}
        initialCategories={categories}
        siteSettings={siteSettings}
        testimonials={testimonials}
      />
    </main>
  );
}

