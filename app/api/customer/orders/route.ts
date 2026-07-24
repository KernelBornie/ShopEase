export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "shopeease_zambia_secret_key_2026";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Session expired or invalid token." }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId: decoded.userId },
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
    console.error("Fetch customer orders error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Allow customer to update/choose their transport system
export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ error: "Session expired or invalid token." }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, carrier } = body;

    if (!orderId || !carrier) {
      return NextResponse.json({ error: "Missing orderId or carrier." }, { status: 400 });
    }

    // Verify order belongs to customer
    const order = await db.order.findFirst({
      where: { id: orderId, userId: decoded.userId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied." }, { status: 404 });
    }

    // Generate a unique tracking number for this Zambian carrier
    const cleanCarrier = carrier.replace(/[^a-zA-Z]/g, "");
    const prefix = (cleanCarrier.substring(0, 3) || "TRK").toUpperCase();
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `ZM-${prefix}-${randNum}`;

    // Update order with selected carrier
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        carrier,
        trackingNumber,
      },
    });

    // Create a TrackingLog entry for this transport selection
    await db.trackingLog.create({
      data: {
        id: `tr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        orderId,
        status: order.status,
        description: `Linked Zambian route using ${carrier}. Route active from ShopEase Lusaka Depot to customer location. Tracking number is ${trackingNumber}.`,
        location: "ShopEase Central Depot, Lusaka",
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Update customer transport carrier error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

