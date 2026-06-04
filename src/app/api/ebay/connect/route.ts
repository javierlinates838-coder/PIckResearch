import { getEbayOAuthUrl } from "@/lib/ebay/client";
import { apiError } from "@/lib/api/responses";

export async function GET() {
  if (!process.env.EBAY_APP_ID) {
    return apiError(
      "eBay OAuth not configured. Set EBAY_APP_ID and related env vars.",
      503,
    );
  }

  const state = crypto.randomUUID();
  const url = getEbayOAuthUrl(state);
  return Response.redirect(url);
}
