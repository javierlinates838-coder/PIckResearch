import {
  BarChart3,
  Newspaper,
  Shield,
  Star,
  Trophy,
  Users,
} from "lucide-react";

export const mainNavigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/players",
    label: "Players",
    icon: Star,
  },
  {
    href: "/teams",
    label: "Teams",
    icon: Shield,
  },
  {
    href: "/news",
    label: "News",
    icon: Newspaper,
  },
  {
    href: "/dashboard#saved",
    label: "Saved",
    icon: Trophy,
  },
  {
    href: "/dashboard#community",
    label: "Market",
    icon: Users,
  },
] as const;
