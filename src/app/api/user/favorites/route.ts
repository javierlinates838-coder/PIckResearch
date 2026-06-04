import { apiError, created, ok, validationError } from "@/lib/api/responses";
import { requireUser } from "@/lib/api/auth";
import { favoriteSchema } from "@/lib/validators/research";

export async function GET(request: Request) {
  const auth = await requireUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const [players, teams] = await Promise.all([
    auth.supabase
      .from("favorite_players")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false }),
    auth.supabase
      .from("favorite_teams")
      .select("*")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (players.error) {
    return apiError(players.error.message, 500);
  }

  if (teams.error) {
    return apiError(teams.error.message, 500);
  }

  return ok({
    players: players.data,
    teams: teams.data,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = favoriteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const table = parsed.data.type === "player" ? "favorite_players" : "favorite_teams";
  const idColumn = parsed.data.type === "player" ? "player_id" : "team_id";
  const { data, error } = await auth.supabase
    .from(table)
    .upsert(
      {
        user_id: auth.user.id,
        [idColumn]: parsed.data.id,
      },
      {
        onConflict: `user_id,${idColumn}`,
      },
    )
    .select("*")
    .single();

  if (error) {
    return apiError(error.message, 500);
  }

  return created(data);
}

export async function DELETE(request: Request) {
  const auth = await requireUser(request);

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = favoriteSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  const table = parsed.data.type === "player" ? "favorite_players" : "favorite_teams";
  const idColumn = parsed.data.type === "player" ? "player_id" : "team_id";
  const { error } = await auth.supabase
    .from(table)
    .delete()
    .eq("user_id", auth.user.id)
    .eq(idColumn, parsed.data.id);

  if (error) {
    return apiError(error.message, 500);
  }

  return ok({ deleted: true });
}
