import { ok } from "@/lib/api/responses";
import { getProviderStatus } from "@/config/providers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return ok(getProviderStatus(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
