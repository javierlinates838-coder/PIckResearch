import { ok } from "@/lib/api/responses";
import { getProviderStatus } from "@/config/providers";

export async function GET() {
  return ok(getProviderStatus());
}
