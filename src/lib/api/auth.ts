import { apiError } from "@/lib/api/responses";
import { createSupabaseAnonClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function requireUser(request: Request) {
  if (!hasSupabaseConfig()) {
    return {
      response: apiError("Supabase is not configured for authenticated user features.", 503),
    };
  }

  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    return {
      response: apiError("Missing bearer token.", 401),
    };
  }

  const supabase = createSupabaseAnonClient(token);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      response: apiError("Invalid or expired session.", 401),
    };
  }

  return {
    supabase,
    user,
  };
}
