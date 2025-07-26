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
    const command = new AnalyzeDocumentCommand({
      Document: { Bytes: buffer },
      FeatureTypes: ["FORMS", "TABLES"],
    });

    const response = await client.send(command);
    const blocks = response.Blocks || [];

    const text = blocks
      .filter((block) => block.BlockType === "LINE")
      .map((block) => block.Text)
      .join(" ");

    const items = [];
    const lineBlocks = blocks.filter((block) => block.BlockType === "LINE");

    for (let i = 0; i < lineBlocks.length - 1; i++) {
      const productLine = lineBlocks[i].Text.trim().toUpperCase();
      const priceLine = lineBlocks[i + 1].Text.trim();

      // Check if current line is a potential product (any uppercase text, excluding summary terms)
      if (
        productLine.match(/[A-Z]/) &&
        !["TOTAL", "TAX", "SUBTOTAL", "CHANGE", "TEND"].some((term) =>
          productLine.includes(term)
        )
      ) {
        // Check if next line is a price
        const priceMatch = priceLine.match(/^\$\s*(\d+(?:\.\d{2})?)$/);
        if (priceMatch) {
          const price = parseFloat(priceMatch[1]);
          if (!isNaN(price)) {
            items.push({ product: productLine, price });
            i++; // Skip the price line as it's paired
          }
        }
      }
    }

    await savePriceData(items);
    return items;
  } catch (error) {
    console.error("AWS Textract error:", error);
    throw new Error("Failed to process receipt");
  }
}
