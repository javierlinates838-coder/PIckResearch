import {
  Goal,
  Newspaper,
  Star,
  Trophy,
} from "lucide-react";

export const mainNavigation = [
  {
    href: "/finder",
    label: "Finder",
    icon: Goal,
  },
  {
    href: "/players",
    label: "Players",
    icon: Star,
  },
  {
    href: "/news",
    label: "News",
    icon: Newspaper,
  },
  {
    href: "/finder#builder",
    label: "Saved",
    icon: Trophy,
  },
] as const;
