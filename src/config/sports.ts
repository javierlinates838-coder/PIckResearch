import type { Sport } from "@/types/sports";

export const supportedSports: Sport[] = [
  {
    key: "nba",
    label: "NBA",
    description: "Player props, injuries, pace, usage, and matchup efficiency.",
  },
  {
    key: "mlb",
    label: "MLB",
    description: "Pitcher props, lineup news, park factors, and batting splits.",
  },
  {
    key: "nfl",
    label: "NFL",
    description: "Injury reports, snap shares, routes, usage, and market movement.",
  },
  {
    key: "nhl",
    label: "NHL",
    description: "Goalie news, shot props, line combinations, and pace context.",
  },
  {
    key: "tennis",
    label: "Tennis",
    description: "Surface splits, form, serve metrics, and matchup tendencies.",
  },
  {
    key: "soccer",
    label: "Soccer",
    description: "Lineups, injuries, xG trends, pace, and market pressure.",
  },
  {
    key: "esports",
    label: "Esports",
    description: "Roster updates, map pools, role usage, and kill prop trends.",
  },
];
