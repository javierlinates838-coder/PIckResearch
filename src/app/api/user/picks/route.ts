import { apiError, created, ok, validationError } from "@/lib/api/responses";
import { requireUser } from "@/lib/api/auth";
import { savedPickSchema } from "@/lib/validators/research";

export async function GET(request: Request) {
  const auth = await requireUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const { data, error } = await auth.supabase
    .from("saved_picks")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError(error.message, 500);
  }

  return ok(data);
}

export async function POST(request: Request) {
  const auth = await requireUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = savedPickSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const { data, error } = await auth.supabase
    .from("saved_picks")
    .insert({
      user_id: auth.user.id,
      sport: parsed.data.sport,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      market: parsed.data.market,
      selection: parsed.data.selection,
      line: parsed.data.line,
      odds: parsed.data.odds,
      sportsbook: parsed.data.sportsbook,
      notes: parsed.data.notes,
    })
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return created(data);
}
