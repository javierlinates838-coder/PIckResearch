import { apiError, ok, validationError } from "@/lib/api/responses";
import { generateAiAnalysis } from "@/lib/ai/analysis";
import { aiAnalysisSchema } from "@/lib/validators/research";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = aiAnalysisSchema.safeParse(body);

  if (!parsed.success) {
    return validationError(parsed.error);
  }

  if (!parsed.data.gameId && !parsed.data.playerId && !parsed.data.teamId) {
    return apiError("At least one research entity id is required.", 422);
  }

  const analysis = await generateAiAnalysis({
    context: parsed.data.context,
    market: parsed.data.market,
    line: parsed.data.line,
  });

  return ok(analysis);
}
