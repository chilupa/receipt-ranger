import { NextResponse } from "next/server";
import { getPriceHistory } from "../../../lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const product = searchParams.get("product");

  if (!product) {
    return NextResponse.json(
      { error: "Product parameter is required" },
      { status: 400 }
    );
  }

  try {
    const history = await getPriceHistory(product);
    return NextResponse.json({ product, history }, { status: 200 });
  } catch (error) {
    console.error("Price comparison error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price history" },
      { status: 500 }
    );
  }
}
