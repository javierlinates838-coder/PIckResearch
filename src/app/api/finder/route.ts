import { type NextRequest } from "next/server";

import { ok, validationError } from "@/lib/api/responses";
import { listPickOpportunities } from "@/lib/repositories/research";
import { finderQuerySchema } from "@/lib/validators/research";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const parsed = finderQuerySchema.safeParse({
    sport: request.nextUrl.searchParams.get("sport") ?? undefined,
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    market: request.nextUrl.searchParams.get("market") ?? undefined,
    app: request.nextUrl.searchParams.get("app") ?? undefined,
    sort: request.nextUrl.searchParams.get("sort") ?? undefined,
    minHitRate: request.nextUrl.searchParams.get("minHitRate") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = await listPickOpportunities({
    sport: parsed.data.sport,
    query: parsed.data.q,
    market: parsed.data.market,
    app: parsed.data.app,
    minHitRate: parsed.data.minHitRate,
    sort: parsed.data.sort,
  });

  return ok(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
