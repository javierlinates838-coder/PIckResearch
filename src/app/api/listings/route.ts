import { ensureUserCookie, getCurrentUserId } from "@/lib/api/user";
import { ok, created, apiError, validationError } from "@/lib/api/responses";
import {
  createListing,
  ensureDemoListings,
  listListings,
} from "@/lib/repositories/listings";
import { createListingSchema } from "@/lib/validators/listing";

export async function GET(request: Request) {
  try {
    await ensureUserCookie();
    const userId = await getCurrentUserId();
    await ensureDemoListings(userId);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") ?? undefined;
    const status = searchParams.get("status") as
      | "draft"
      | "listed"
      | "sold"
      | "shipped"
      | undefined;
    const limit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);

    const result = await listListings(userId, {
      search,
      status,
      limit,
      offset,
    });
    return ok(result);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to load listings",
      500,
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureUserCookie();
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = createListingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const listing = await createListing(userId, {
      photos: parsed.data.photos ?? [],
    });
    return created(listing);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Failed to create listing",
      500,
    );
  }
}
