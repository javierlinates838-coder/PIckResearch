import { ok } from "@/lib/api/responses";
import { getProviderStatus } from "@/lib/config/providers";

export async function GET() {
  return ok(getProviderStatus());
}
