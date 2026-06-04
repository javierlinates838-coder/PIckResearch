import { getCurrentUserId } from "@/lib/api/user";
import { enhancePhoto } from "@/lib/photoroom/enhance";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { enhancePhotoSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = enhancePhotoSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const enhancedUrl = await enhancePhoto(parsed.data.image);

    if (parsed.data.listingId) {
      const listing = await getListing(parsed.data.listingId, userId);
      if (!listing) return apiError("Listing not found", 404);

      const photoId = parsed.data.photoId ?? crypto.randomUUID();
      const enhancedPhotos = [
        ...listing.enhancedPhotos,
        { id: photoId, url: enhancedUrl, enhancedUrl },
      ];
      const photos = listing.photos.map((p) =>
        p.id === parsed.data.photoId ? { ...p, enhancedUrl } : p,
      );

      await updateListing(parsed.data.listingId, userId, {
        enhancedPhotos,
        photos: photos.length ? photos : listing.photos,
      });
    }

    return ok({ enhancedUrl });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Photo enhancement failed",
      500,
    );
  }
}
