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

function extractStoreName(lineBlocks) {
  // Look for store name in first few lines
  const firstLines = lineBlocks.slice(0, 8).map(block => block.Text.trim());
  
  for (const line of firstLines) {
    // Skip empty lines, numbers, addresses, phone numbers, dates
    if (!line || 
        /^\d+$/.test(line) || 
        /^\d{1,5}\s/.test(line) || 
        /\d{3}-\d{3}-\d{4}/.test(line) ||
        /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(line) ||
        /^(ST|STORE|#|TEL|PHONE)/i.test(line)) {
      continue;
    }
    
    // Look for potential store names (2+ words or single capitalized word > 3 chars)
    if (line.length > 3 && 
        (line.match(/^[A-Z][A-Z\s&'-]+$/) || // All caps with spaces
         line.match(/^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/))) { // Title case
      return line.trim();
    }
  }
  
  return "Unknown Store";
}

export async function extractTextFromImage(buffer) {
  try {
    const command = new AnalyzeDocumentCommand({
      Document: { Bytes: buffer },
      FeatureTypes: ["FORMS", "TABLES"],
    });

    const response = await client.send(command);
    const blocks = response.Blocks || [];
    const lineBlocks = blocks.filter((block) => block.BlockType === "LINE");
    
    // Extract store name
    const storeName = extractStoreName(lineBlocks);

    const items = [];
    for (let i = 0; i < lineBlocks.length - 1; i++) {
      const productLine = lineBlocks[i].Text.trim().toUpperCase();
      const priceLine = lineBlocks[i + 1].Text.trim();

      // Check if current line is a potential product
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

    console.log('storeName :>> ', storeName);
    await savePriceData(items, storeName);
    return { items, storeName };
  } catch (error) {
    console.error("AWS Textract error:", error);
    throw new Error("Failed to process receipt");
  }
}
