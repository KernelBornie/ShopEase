import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, address, deliveryMode, cartItems, total, userId, momoOperator, momoPhone } = body;

    if (!name || !email || !phone || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Missing required order fields." }, { status: 400 });
    }

    // Generate readable random order number
    const orderNumber = `SE-${Date.now().toString().slice(-5)}-${Math.floor(100 + Math.random() * 900)}`;
    const orderId = `order_${Date.now().toString()}_${Math.floor(Math.random() * 1000)}`;

    // Create the order, items, and initial tracking status in a database transaction
    await db.$transaction(async (tx) => {
      // 1. Create order record
      await tx.order.create({
        data: {
          id: orderId,
          orderNumber,
          userId: userId || null,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          address,
          deliveryMode,
          total: parseFloat(total),
          status: "PENDING",
        },
      });

      // 2. Create order items records & update product stock
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            id: `item_${Date.now().toString()}_${Math.floor(Math.random() * 100000)}`,
            orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price),
            name: item.name,
          },
        });

        // Update product stock (decrease stock)
        try {
          const prod = await tx.product.findUnique({ where: { id: item.productId } });
          if (prod) {
            const newStock = Math.max(0, prod.stock - item.quantity);
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: newStock },
            });
          }
        } catch (stockError) {
          console.error("Stock reduction error:", stockError);
        }
      }

      // 3. Create initial tracking log
      const formattedOperator = momoOperator === "AIRTEL" ? "Airtel Money" :
                                momoOperator === "MTN" ? "MTN MoMo" :
                                momoOperator === "MPESA" ? "M-Pesa" :
                                momoOperator === "ZAMTEL" ? "Zamtel Kwacha" : "Mobile Money";
      const formattedMomo = momoOperator && momoPhone ? ` (Authorized via ${formattedOperator} - Wallet: ${momoPhone})` : "";
      await tx.trackingLog.create({
        data: {
          id: `tr_${Date.now().toString()}_${Math.floor(Math.random() * 1000)}`,
          orderId,
          status: "PENDING",
          description: `Order placed successfully${formattedMomo}. Pending shop dispatch review.`,
          location: "ShopEase Central Depot, Lusaka",
        },
      });
    });

    return NextResponse.json({ orderNumber, orderId }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

