import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Missing campaign id or action." }, { status: 400 });
    }

    // Retrieve existing campaign
    const campaign = await db.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    let updatedData = {};
    if (action === "like") {
      updatedData = { likes: (campaign.likes || 0) + 1 };
    } else if (action === "view") {
      updatedData = { views: (campaign.views || 0) + 1 };
    } else {
      return NextResponse.json({ error: "Invalid action. Supported: like, view." }, { status: 400 });
    }

    const updatedCampaign = await db.campaign.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error("Failed to update campaign interaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
