import { getCurrentUserId } from "@/lib/api/user";
import { generateListingCopy } from "@/lib/ai/listing-generator";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { generateListingSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = generateListingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const listing = await getListing(parsed.data.listingId, userId);
    if (!listing) return apiError("Listing not found", 404);
    if (!listing.aiIdentification) {
      return apiError("Run photo analysis first", 400);
    }

    const listingCopy = await generateListingCopy({
      identification: listing.aiIdentification,
      market: listing.marketResearch,
      condition: listing.condition,
    });

    const updated = await updateListing(parsed.data.listingId, userId, {
      listingCopy,
      title: listingCopy.title,
      description: listingCopy.description,
      keywords: listingCopy.keywords,
      itemSpecifics: listingCopy.itemSpecifics,
    });

    return ok({ listingCopy, listing: updated });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Listing generation failed",
      500,
    );
  }
}
