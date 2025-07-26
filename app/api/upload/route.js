import { NextResponse } from "next/server";
import { extractTextFromImage } from "../../../lib/aws";

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
    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("Connected to database:", process.env.DB_NAME); // Log the intended database
    const tablesResult = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(
      "Tables found:",
      tablesResult.rows.map((row) => row.table_name)
    ); // Log all tables
    const priceResult = await pool.query(
      "SELECT p.product, p.price, r.uploaded_at FROM prices p LEFT JOIN receipts r ON p.receipt_id = r.id ORDER BY r.uploaded_at DESC"
    );
    return NextResponse.json(priceResult.rows);
  } catch (error) {
    console.error("Database error:", error.stack); // Log full stack trace
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "4mb",
    },
  },
};
