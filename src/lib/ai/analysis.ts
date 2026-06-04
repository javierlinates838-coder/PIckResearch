import "server-only";

import type { AiAnalysis } from "@/types/sports";

interface AnalysisInput {
  context: string;
  market?: string;
  line?: number;
}

export async function generateAiAnalysis(input: AnalysisInput): Promise<AiAnalysis> {
  if (process.env.AI_PROVIDER_API_KEY) {
    // Production providers should be implemented here behind this server-only boundary.
    // The API contract remains stable while the provider SDK stays out of client bundles.
  }

  const marketLabel = input.market ?? "market";
  const lineLabel = typeof input.line === "number" ? ` around ${input.line}` : "";

  return {
    summary: `The current ${marketLabel}${lineLabel} deserves attention because the research context shows a measurable gap between recent role, matchup conditions, and market price.`,
    matchupAdvantages: [
      "Recent usage and minutes trends support a larger opportunity share than season baseline.",
      "Opponent profile creates a path for the selected market to outperform if the game script holds.",
      "Line movement and public splits should be compared against injury/news changes before entry.",
    ],
    risks: [
      "A late injury or lineup update can invalidate the projected role.",
      "Market movement may already price in the strongest part of the edge.",
      "Blowout, weather, rotation, or coaching volatility can reduce confidence.",
    ],
    valuation: `Treat this as potentially undervalued only if the current book price remains better than the projected fair line after confirming the latest news: ${input.context.slice(0, 220)}${
      input.context.length > 220 ? "..." : ""
    }`,
  };
}
