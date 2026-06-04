import { type NextRequest } from "next/server";

import { ok, validationError } from "@/lib/api/responses";
import { getDashboardResearch } from "@/lib/repositories/research";
import { dashboardQuerySchema } from "@/lib/validators/research";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const parsed = dashboardQuerySchema.safeParse({
    sport: request.nextUrl.searchParams.get("sport") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const data = await getDashboardResearch(parsed.data);
  return ok(data, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
