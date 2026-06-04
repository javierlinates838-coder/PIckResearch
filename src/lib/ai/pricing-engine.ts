import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import type { MarketResearch, PricingRecommendation } from "@/types/reseller";

const pricingSchema = z.object({
  aggressive: z.number(),
  market: z.number(),
  quickSale: z.number(),
  opportunity: z.string().optional(),
  confidence: z.number().min(0).max(1),
});

export async function recommendPricing(
  market: MarketResearch,
  costBasis = 0,
): Promise<PricingRecommendation> {
  if (!process.env.OPENAI_API_KEY) {
    return heuristicPricing(market, costBasis);
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: pricingSchema,
    prompt: `As an eBay pricing expert, recommend three price points from sold comps.
Aggressive = maximize profit, Market = balanced sell-through, Quick-sale = fast flip.
Flag underpriced opportunities if avg comp is well above typical ask.
Cost basis: $${costBasis}
Market data: ${JSON.stringify(market)}`,
  });

  return {
    ...object,
    confidence: Math.round(object.confidence * 100) / 100,
  };
}

export function heuristicPricing(
  market: MarketResearch,
  costBasis: number,
): PricingRecommendation {
  const { avgSoldPrice, lowestSoldPrice, highestSoldPrice, trend } = market;
  let marketPrice = market.suggestedBinPrice;
  if (trend === "rising") marketPrice *= 1.03;
  if (trend === "falling") marketPrice *= 0.97;

  const aggressive = Number((highestSoldPrice * 0.95).toFixed(2));
  const marketRec = Number(marketPrice.toFixed(2));
  const quickSale = Number((lowestSoldPrice * 1.02).toFixed(2));

  let opportunity: string | undefined;
  if (costBasis > 0 && marketRec > costBasis * 2) {
    opportunity = `Strong margin: market price $${marketRec} vs cost $${costBasis}`;
  } else if (avgSoldPrice > marketRec * 1.15) {
    opportunity = "Comps trending above suggested BIN — room to test higher price";
  }

  return {
    aggressive,
    market: marketRec,
    quickSale,
    opportunity,
    confidence: market.source === "ebay" ? 0.82 : 0.65,
  };
}
