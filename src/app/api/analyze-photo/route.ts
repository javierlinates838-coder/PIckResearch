import { getCurrentUserId } from "@/lib/api/user";
import { identifyProductFromImages } from "@/lib/ai/product-vision";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { analyzePhotosSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = analyzePhotosSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const identification = await identifyProductFromImages(parsed.data.images);

    if (parsed.data.listingId) {
      const listing = await getListing(parsed.data.listingId, userId);
      if (!listing) return apiError("Listing not found", 404);
      await updateListing(parsed.data.listingId, userId, {
        aiIdentification: identification,
        brand: identification.brand,
        model: identification.model,
        color: identification.color,
        condition: identification.condition,
        category: identification.category,
        title: identification.product,
      });
    }

    return ok({ identification });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Photo analysis failed",
      500,
    );
  }
}
