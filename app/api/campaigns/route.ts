import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET: Return all campaigns ordered by newest first
export async function GET() {
  try {
    const campaigns = await db.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, campaigns });
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Add a new promotional video ad campaign (handles direct upload of videoFile)
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const highlights = formData.get("highlights") as string | null;
    const videoFile = formData.get("videoFile") as File | null;

    if (!title || !highlights) {
      return NextResponse.json({ error: "Title and Highlights are required." }, { status: 400 });
    }

    if (!videoFile) {
      return NextResponse.json({ error: "A direct video upload is required." }, { status: 400 });
    }

    // Direct upload saving logic (Only file uploads, no external URLs)
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads folder if missing
    const uploadsDir = path.join(process.cwd(), "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Sanitize name and generate unique filename
    const sanitizedOriginalName = videoFile.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .toLowerCase();
    const fileExt = path.extname(sanitizedOriginalName) || ".mp4";
    const baseName = path.basename(sanitizedOriginalName, fileExt);
    const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Set the campaign media video URL to our local upload endpoint
    const videoUrl = `/api/uploads?file=${uniqueFilename}`;

    // Create the DB record
    const newCampaign = await db.campaign.create({
      data: {
        title,
        highlights,
        videoUrl,
        views: 0,
        likes: 0,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, campaign: newCampaign });
  } catch (error) {
    console.error("Failed to publish video ad campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update an existing campaign's title/highlights/videoUrl
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string | null;
    const highlights = formData.get("highlights") as string | null;
    const videoFile = formData.get("videoFile") as File | null;

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required." }, { status: 400 });
    }

    const campaign = await db.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    let videoUrl = campaign.videoUrl;

    if (videoFile && videoFile.size > 0) {
      const bytes = await videoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const sanitizedOriginalName = videoFile.name
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      const fileExt = path.extname(sanitizedOriginalName) || ".mp4";
      const baseName = path.basename(sanitizedOriginalName, fileExt);
      const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);
      videoUrl = `/api/uploads?file=${uniqueFilename}`;
    }

    const updatedCampaign = await db.campaign.update({
      where: { id },
      data: {
        title: title || campaign.title,
        highlights: highlights || campaign.highlights,
        videoUrl,
      },
    });

    return NextResponse.json({ success: true, campaign: updatedCampaign });
  } catch (error) {
    console.error("Failed to update campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete an existing campaign
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Campaign ID is required." }, { status: 400 });
    }

    await db.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
