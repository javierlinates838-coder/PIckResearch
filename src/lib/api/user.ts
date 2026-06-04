import { cookies } from "next/headers";

import { getDemoUserId } from "@/lib/repositories/listings";

const USER_COOKIE = "resellai_user_id";

export async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(USER_COOKIE)?.value;
  if (fromCookie) return fromCookie;

  return getDemoUserId();
}

export async function ensureUserCookie() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(USER_COOKIE)?.value;
  if (existing) return existing;

  const userId = getDemoUserId();
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return userId;
}
