import { DashboardHero } from "@/components/home/dashboard-hero";
import { StatsOverview } from "@/components/home/stats-overview";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <DashboardHero />
      <StatsOverview />
    </div>
  );
}
