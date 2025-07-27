import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function savePriceData(items, storeName) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    // Create a new receipt with store name
    const receiptResult = await client.query(
      "INSERT INTO receipts (receipt_id, store_name, uploaded_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id",
      [`receipt_${Date.now()}`, storeName]
    );
    const receiptId = receiptResult.rows[0].id;
    
    for (const item of items) {
      await client.query(
        "INSERT INTO prices (receipt_id, product, price, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)",
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
    "SELECT p.price, r.uploaded_at, r.store_name FROM prices p JOIN receipts r ON p.receipt_id = r.id WHERE p.product = $1 ORDER BY r.uploaded_at",
    [product]
  );
  return result.rows;
}
