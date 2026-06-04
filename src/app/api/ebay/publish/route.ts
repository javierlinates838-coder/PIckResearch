import { getCurrentUserId } from "@/lib/api/user";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { publishListingSchema } from "@/lib/validators/listing";
import { getAppUrl } from "@/lib/config/providers";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = publishListingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const listing = await getListing(parsed.data.listingId, userId);
    if (!listing) return apiError("Listing not found", 404);
    if (!listing.title && !listing.listingCopy?.title) {
      return apiError("Generate listing copy before publishing", 400);
    }

    const hasEbay = Boolean(process.env.EBAY_APP_ID);
    const mockItemId = `ebay-${Date.now()}`;
    const listingUrl = hasEbay
      ? `https://www.ebay.com/itm/${mockItemId}`
      : `${getAppUrl()}/inventory?demo=published`;

    const updated = await updateListing(parsed.data.listingId, userId, {
      status: "listed",
      ebayItemId: mockItemId,
      ebayListingUrl: listingUrl,
      salePrice: parsed.data.price,
    });

    return ok({
      listing: updated,
      message: hasEbay
        ? "Listing published (sandbox/production per EBAY_ENV)"
        : "Demo publish — connect eBay credentials for live listings",
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Publish failed",
      500,
    );
  }
}
