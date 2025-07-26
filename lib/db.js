import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function savePriceData(items) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create a new receipt
    const receiptResult = await client.query(
      "INSERT INTO receipts (receipt_id) VALUES ($1) RETURNING id",
      [`receipt_${Date.now()}`] // Unique receipt ID based on timestamp
    );
    const receiptId = receiptResult.rows[0].id;

    // Insert each item into prices table
    for (const item of items) {
      await client.query(
        "INSERT INTO prices (receipt_id, product, price) VALUES ($1, $2, $3)",
        [receiptId, item.product, item.price]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getPriceHistory(product) {
  const result = await pool.query(
    "SELECT p.price, r.uploaded_at FROM prices p JOIN receipts r ON p.receipt_id = r.id WHERE p.product = $1 ORDER BY r.uploaded_at",
    [product]
  );
  return result.rows;
}

export async function getPriceData() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT product, price, created_at FROM prices ORDER BY created_at DESC"
    );
    return result.rows;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch price data");
  } finally {
    client.release();
  }
}
