import { getCurrentUserId } from "@/lib/api/user";
import { recommendPricing } from "@/lib/ai/pricing-engine";
import { searchSoldListings } from "@/lib/ebay/client";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { marketResearchSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = marketResearchSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const market = await searchSoldListings(parsed.data.query);
    const pricing = await recommendPricing(market);

    if (parsed.data.listingId) {
      const listing = await getListing(parsed.data.listingId, userId);
      if (!listing) return apiError("Listing not found", 404);
      await updateListing(parsed.data.listingId, userId, {
        marketResearch: market,
        pricing,
      });
    }

    return ok({ market, pricing });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Market research failed",
      500,
    );
  }
}
