import { ensureUserCookie, getCurrentUserId } from "@/lib/api/user";
import { ok, apiError } from "@/lib/api/responses";
import {
  ensureDemoListings,
  getAnalyticsSummary,
} from "@/lib/repositories/listings";

export async function GET() {
  try {
    await ensureUserCookie();
    const userId = await getCurrentUserId();
    await ensureDemoListings(userId);
    const analytics = await getAnalyticsSummary(userId);
    return ok(analytics);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Analytics failed",
      500,
    );
  }
}
