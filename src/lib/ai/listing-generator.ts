import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import type {
  ListingCopy,
  MarketResearch,
  ProductIdentification,
} from "@/types/reseller";

const listingSchema = z.object({
  title: z.string().max(80),
  description: z.string(),
  itemSpecifics: z.record(z.string(), z.string()),
  keywords: z.array(z.string()),
  shippingSuggestions: z.array(z.string()),
});

export async function generateListingCopy(input: {
  identification: ProductIdentification;
  market?: MarketResearch;
  condition?: string;
}): Promise<ListingCopy> {
  if (!process.env.OPENAI_API_KEY) {
    return mockListingCopy(input.identification, input.market);
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: listingSchema,
    prompt: `Generate an SEO-optimized eBay listing for resale.

Product: ${JSON.stringify(input.identification)}
Market comps: ${input.market ? JSON.stringify(input.market) : "unavailable"}
Condition override: ${input.condition ?? input.identification.condition}

Rules:
- Title max 80 chars, front-load brand/model/size keywords
- Description: bullet features, condition details, what's included, shipping/returns note
- Item specifics: all relevant eBay fields as key-value
- Keywords: 10-15 search terms
- Shipping: 3 practical suggestions (carrier, packaging, handling time)`,
  });

  return object;
}

function mockListingCopy(
  id: ProductIdentification,
  market?: MarketResearch,
): ListingCopy {
  const priceHint = market
    ? ` Comparable sold avg: $${market.avgSoldPrice}.`
    : "";
  return {
    title: `${id.brand} ${id.model} ${id.color} — ${id.condition}`.slice(0, 80),
    description: `**${id.product}**

**Condition:** ${id.condition}
**Brand:** ${id.brand}
**Model:** ${id.model}
**Color:** ${id.color}

• Authentic item — photos show actual condition
• Ships within 1 business day via USPS Priority
• Packed securely with bubble wrap
• 30-day returns accepted per eBay policy${priceHint}

Questions? Message before buying. Thanks for looking!`,
    itemSpecifics: {
      Brand: id.brand,
      Model: id.model,
      Color: id.color,
      Type: id.category.split(">").pop()?.trim() ?? "General",
      Condition: id.condition,
    },
    keywords: [
      id.brand.toLowerCase(),
      id.model.toLowerCase(),
      id.color.toLowerCase(),
      id.product.toLowerCase(),
      "authentic",
      "fast shipping",
      id.category.split(">").pop()?.trim().toLowerCase() ?? "resale",
    ],
    shippingSuggestions: [
      "USPS Priority Mail — 1–3 day delivery for most items under 70 lbs",
      "Use poly mailer for soft goods; box + bubble wrap for fragile items",
      "Offer calculated shipping or free shipping baked into BIN price",
    ],
  };
}
