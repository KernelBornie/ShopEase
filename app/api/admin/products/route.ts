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

// GET: Retrieve all products for admin catalog view
export async function GET(req: NextRequest) {
  try {
    const products = await db.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new product
export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, stock, images, category, featured } = body;

    if (!name || !description || price === undefined || stock === undefined) {
      return NextResponse.json({ error: "Missing required product fields." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    // Check slug uniqueness
    const existing = await db.product.findFirst({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const productId = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Convert images array to a JSON-escaped string like the seeded product records expect
    const finalImagesStr = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === "string" && images.startsWith("[")
      ? images
      : JSON.stringify([images || "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400"]);

    // Ensure the category exists in our Category table
    const normalizedCategory = (category || "general").trim();
    const catSlug = normalizedCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (catSlug) {
      const existingCategory = await db.category.findUnique({
        where: { slug: catSlug }
      });
      if (!existingCategory) {
        await db.category.create({
          data: {
            id: `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: normalizedCategory,
            slug: catSlug,
          }
        });
      }
    }

    const product = await db.product.create({
      data: {
        id: productId,
        name,
        slug: finalSlug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: JSON.stringify(finalImagesStr), // Escape nested format matching existing records
        category: normalizedCategory,
        featured: !!featured,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Edit an existing product
export async function PUT(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, price, stock, images, category, featured } = body;

    if (!id || !name || !description || price === undefined || stock === undefined) {
      return NextResponse.json({ error: "Missing required update fields." }, { status: 400 });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const finalImagesStr = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === "string" && images.startsWith("[")
      ? images
      : JSON.stringify([images || "https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&q=80&w=400"]);

    // Ensure the category exists in our Category table
    const normalizedCategory = (category || "general").trim();
    const catSlug = normalizedCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (catSlug) {
      const existingCategory = await db.category.findUnique({
        where: { slug: catSlug }
      });
      if (!existingCategory) {
        await db.category.create({
          data: {
            id: `cat_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: normalizedCategory,
            slug: catSlug,
          }
        });
      }
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        images: JSON.stringify(finalImagesStr),
        category: normalizedCategory,
        featured: !!featured,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove a product
export async function DELETE(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing product ID." }, { status: 400 });
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
