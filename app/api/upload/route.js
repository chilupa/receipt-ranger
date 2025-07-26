import { NextResponse } from "next/server";
import { extractTextFromImage } from "../../../lib/aws";
import { savePriceData } from "../../../lib/db";

export async function POST(request) {
  try {
    const body = await request.text();
    console.log("Received body length:", body.length);
    if (!body || body.length === 0) {
      throw new Error("Empty image data");
    }
    const buffer = Buffer.from(body, "base64");
    console.log("Buffer length:", buffer.length);
    const items = await extractTextFromImage(buffer);
    await savePriceData(items);
    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
