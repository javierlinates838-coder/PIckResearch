import { getCurrentUserId } from "@/lib/api/user";
import { ok, apiError, validationError } from "@/lib/api/responses";
import {
  deleteListing,
  getListing,
  updateListing,
} from "@/lib/repositories/listings";
import { updateListingSchema } from "@/lib/validators/listing";
import type {
  ListingCopy,
  MarketResearch,
  PricingRecommendation,
  ProductIdentification,
  ProfitBreakdown,
  ListingPhoto,
} from "@/types/reseller";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const listing = await getListing(id, userId);
    if (!listing) return apiError("Listing not found", 404);
    return ok(listing);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load listing",
      500,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = updateListingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const listing = await updateListing(id, userId, {
      ...parsed.data,
      aiIdentification: parsed.data.aiIdentification as
        | ProductIdentification
        | undefined,
      marketResearch: parsed.data.marketResearch as MarketResearch | undefined,
      pricing: parsed.data.pricing as PricingRecommendation | undefined,
      listingCopy: parsed.data.listingCopy as ListingCopy | undefined,
      profit: parsed.data.profit as ProfitBreakdown | undefined,
      photos: parsed.data.photos as ListingPhoto[] | undefined,
      enhancedPhotos: parsed.data.enhancedPhotos as ListingPhoto[] | undefined,
    });
    return ok(listing);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to update listing",
      500,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId();
    await deleteListing(id, userId);
    return ok({ deleted: true });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to delete listing",
      500,
    );
  }
}
