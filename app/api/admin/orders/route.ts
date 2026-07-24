export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shopeease_zambia_secret_key_2026";

// Authenticate Admin
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

export async function GET(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const orders = await db.order.findMany({
      include: {
        OrderItem: {
          include: {
            Product: true,
          },
        },
        TrackingLog: {
          orderBy: { timestamp: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await authenticateAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, status, description, location, carrier, trackingNumber } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status." }, { status: 400 });
    }

    // Update order status, carrier, and tracking number if provided
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        carrier: carrier !== undefined ? carrier : undefined,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined,
      },
    });

    // Add a tracking log entry
    await db.trackingLog.create({
      data: {
        id: `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId,
        status,
        description: description || `Linked with route utilizing ${carrier || "local courier"}. Route status set to ${status}.`,
        location: location || "ShopEase Central Depot, Lusaka",
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Admin order update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
