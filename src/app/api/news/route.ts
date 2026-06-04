import { type NextRequest } from "next/server";

import { ok, validationError } from "@/lib/api/responses";
import { listNews } from "@/lib/repositories/research";
import { newsQuerySchema } from "@/lib/validators/research";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const parsed = newsQuerySchema.safeParse({
    sport: request.nextUrl.searchParams.get("sport") ?? undefined,
    severity: request.nextUrl.searchParams.get("severity") ?? undefined,
    type: request.nextUrl.searchParams.get("type") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const items = await listNews(parsed.data);
  return ok(items, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
