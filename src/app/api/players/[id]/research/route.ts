import { apiError, ok } from "@/lib/api/responses";
import { getPlayerResearch } from "@/lib/repositories/research";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const research = await getPlayerResearch(id);

  if (!research) {
    return apiError("Player research not found", 404);
  }

  return ok(research);
}
