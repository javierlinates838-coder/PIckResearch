import { type NextRequest } from "next/server";

import { ok, validationError } from "@/lib/api/responses";
import { listTeams } from "@/lib/repositories/research";
import { listQuerySchema } from "@/lib/validators/research";

export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse({
    sport: request.nextUrl.searchParams.get("sport") ?? undefined,
    q: request.nextUrl.searchParams.get("q") ?? undefined,
  });

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const teams = await listTeams({
    sport: parsed.data.sport,
    query: parsed.data.q,
  });

  return ok(teams);
}
