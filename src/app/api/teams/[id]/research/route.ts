import { apiError, ok } from "@/lib/api/responses";
import { getTeamResearch } from "@/lib/repositories/research";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const research = await getTeamResearch(id);

  if (!research) {
    return apiError("Team research not found", 404);
  }

  return ok(research);
}
