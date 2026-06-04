import { getCurrentUserId } from "@/lib/api/user";
import { calculateProfit } from "@/lib/fees";
import { ok, apiError, validationError } from "@/lib/api/responses";
import { getListing, updateListing } from "@/lib/repositories/listings";
import { profitCalcSchema } from "@/lib/validators/listing";

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = await request.json();
    const parsed = profitCalcSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const profit = calculateProfit({
      salePrice: parsed.data.salePrice,
      shippingCost: parsed.data.shippingCost,
      costBasis: parsed.data.costBasis,
      taxRate: parsed.data.taxRate,
    });

    if (parsed.data.listingId) {
      const listing = await getListing(parsed.data.listingId, userId);
      if (!listing) return apiError("Listing not found", 404);
      await updateListing(parsed.data.listingId, userId, {
        profit,
        salePrice: profit.salePrice,
        shippingCost: profit.shippingCost,
        ebayFees: profit.ebayFees,
        taxAmount: profit.taxAmount,
        costBasis: profit.costBasis,
        netProfit: profit.netProfit,
        roiPct: profit.roiPct,
      });
    }

    return ok({ profit });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Profit calculation failed",
      500,
    );
  }
}
