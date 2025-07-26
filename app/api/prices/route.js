import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const dbName = (await client.query("SELECT current_database()")).rows[0]
      .current_database;
    console.log("Actually connected to:", dbName);
    const tables = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(
      "Available tables:",
      tables.rows.map((row) => row.table_name)
    );
    const result = await client.query(
      "SELECT p.product, p.price, r.uploaded_at FROM prices p LEFT JOIN receipts r ON p.receipt_id = r.id ORDER BY r.uploaded_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database issue:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
