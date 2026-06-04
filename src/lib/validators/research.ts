import { z } from "zod";

export const sportKeySchema = z.enum([
  "nba",
  "mlb",
  "nfl",
  "nhl",
  "tennis",
  "soccer",
  "esports",
]);

export const dashboardQuerySchema = z.object({
  sport: sportKeySchema.optional(),
});

export const listQuerySchema = z.object({
  sport: sportKeySchema.optional(),
  q: z.string().trim().min(1).max(80).optional(),
});

export const newsQuerySchema = z.object({
  sport: sportKeySchema.optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  type: z
    .enum(["injury", "suspension", "lineup", "coaching", "transaction", "general"])
    .optional(),
});

export const aiAnalysisSchema = z.object({
  gameId: z.string().min(1).optional(),
  playerId: z.string().min(1).optional(),
  teamId: z.string().min(1).optional(),
  market: z.string().trim().min(2).max(80).optional(),
  line: z.number().finite().optional(),
  context: z.string().trim().min(10).max(4000),
});

export const savedPickSchema = z.object({
  sport: sportKeySchema,
  entityType: z.enum(["game", "player", "team"]),
  entityId: z.string().min(1),
  market: z.string().trim().min(2).max(80),
  selection: z.string().trim().min(1).max(160),
  line: z.number().finite().optional(),
  odds: z.number().int().min(-10000).max(10000).optional(),
  sportsbook: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const favoriteSchema = z.object({
  type: z.enum(["player", "team"]),
  id: z.string().min(1),
});
