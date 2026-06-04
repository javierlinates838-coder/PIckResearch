import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import type { ProductIdentification } from "@/types/reseller";

const identificationSchema = z.object({
  product: z.string(),
  brand: z.string(),
  model: z.string(),
  color: z.string(),
  condition: z.string(),
  category: z.string(),
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export async function identifyProductFromImages(
  imageDataUrls: string[],
): Promise<ProductIdentification> {
  if (!process.env.OPENAI_API_KEY) {
    return mockIdentification(imageDataUrls.length);
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: identificationSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are an expert eBay reseller. Analyze these product photo(s) and identify the item for listing.
Return brand, model, color, estimated condition (New, Like New, Used, For parts), eBay category path, and confidence 0-1.
Be specific; if uncertain, lower confidence and explain in notes.`,
          },
          ...imageDataUrls.slice(0, 5).map((url) => ({
            type: "image" as const,
            image: url,
          })),
        ],
      },
    ],
  });

  return {
    ...object,
    confidence: Math.round(object.confidence * 100) / 100,
  };
}

function mockIdentification(photoCount: number): ProductIdentification {
  const samples = [
    {
      product: "Nike Air Max 90 Sneakers",
      brand: "Nike",
      model: "Air Max 90",
      color: "White/Red",
      condition: "Pre-owned — Good",
      category: "Clothing, Shoes & Accessories > Men > Men's Shoes > Athletic Shoes",
      confidence: 0.87,
    },
    {
      product: "Apple iPhone 13 128GB",
      brand: "Apple",
      model: "iPhone 13",
      color: "Midnight",
      condition: "Used — Very Good",
      category: "Cell Phones & Accessories > Cell Phones & Smartphones",
      confidence: 0.91,
    },
    {
      product: "Vintage Levi's 501 Jeans",
      brand: "Levi's",
      model: "501 Original",
      color: "Blue Denim",
      condition: "Used — Good",
      category: "Clothing, Shoes & Accessories > Men > Men's Clothing > Jeans",
      confidence: 0.84,
    },
  ];
  const pick = samples[photoCount % samples.length];
  return { ...pick, notes: "Demo identification — connect OPENAI_API_KEY for live vision." };
}
