import {
  TextractClient,
  AnalyzeDocumentCommand,
} from "@aws-sdk/client-textract";
import { savePriceData } from "./db";

const client = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function extractTextFromImage(buffer) {
  try {
    console.log("Processing buffer of length:", buffer.length);
    const command = new AnalyzeDocumentCommand({
      Document: {
        Bytes: buffer,
      },
      FeatureTypes: ["FORMS"],
    });

    const response = await client.send(command);
    const blocks = response.Blocks || [];

    // Simple text extraction - assumes format like "Item $price"
    const text = blocks
      .filter((block) => block.BlockType === "LINE")
      .map((block) => block.Text)
      .join(" ");

    console.log("text :>> ", text);

    // Extract items by pairing consecutive product and price lines
    const items = [];
    const lineBlocks = blocks.filter((block) => block.BlockType === "LINE");

    for (let i = 0; i < lineBlocks.length - 1; i++) {
      const productLine = lineBlocks[i];
      const priceLine = lineBlocks[i + 1];

      // Check if current line is a product (uppercase text, excluding summary terms)
      const productMatch = productLine.Text.match(/^([A-Z\s]+)$/);
      const productText = productMatch
        ? productMatch[1].trim().toUpperCase()
        : "";
      // Exclude summary terms like TOTAL, TEND, SUBTOTAL, TAX
      if (
        productMatch &&
        !["TOTAL", "TEND", "SUBTOTAL", "TAX"].some((term) =>
          productText.includes(term)
        )
      ) {
        // Check if next line is a price (starts with "$" followed by number, with optional decimals)
        const priceMatch = priceLine.Text.match(/^\$\s*(\d+(?:\.\d{2})?)$/);

        if (priceMatch) {
          items.push({
            product: productText, // Use the matched product name
            price: parseFloat(priceMatch[1]), // Extract price
          });
          i++; // Skip the price line as it's paired
        }
      }
    }

    console.log("Extracted items:", items);
    await savePriceData(items); // Save to database with new receipt
    return items;
  } catch (error) {
    console.error("AWS Textract error:", error);
    throw new Error("Failed to process receipt");
  }
}
