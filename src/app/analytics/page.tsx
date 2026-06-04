import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata = {
  title: "Analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--muted)]">
          Revenue, profit, sell-through rate, and top categories.
        </p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
